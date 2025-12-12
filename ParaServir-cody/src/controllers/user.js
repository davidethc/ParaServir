import { pool } from "../db.js";
import { checkDuplicateEmail } from "../helpers/checkDuplicateEmail.js";
import bcrypt from "bcrypt";
import { createWorker, updateWorker } from "./worker.js";
import { normalizeUserInput } from "../helpers/normalizeUser.js";
import { sendVerificationEmail } from "../helpers/mail.js";
import { createToken } from "../helpers/jwt.js";

export const getMe = async (req, res) => {
    try {
        const userId = req.user?.id;

        const { rows } = await pool.query(
            `SELECT u.id, u.email, u.role, u.is_verified, u.created_at,
                    p.first_name, p.last_name, p.cedula, p.phone, 
                    p.location, p.avatar_url
             FROM users u
             INNER JOIN profiles p ON u.id = p.user_id
             WHERE u.id = $1`,
            [userId]
        );

        if (!rows || rows.length === 0) {
            return res.status(404).json({
                status: "error",
                message: "Usuario no encontrado"
            });
        }

        // Si es trabajador, incluir información del perfil profesional
        let userData = rows[0];
        if (userData.role === 'trabajador') {
            const workerProfile = await pool.query(
                `SELECT years_experience, certification_url, verification_status, is_active
                 FROM worker_profiles
                 WHERE user_id = $1`,
                [userId]
            );
            if (workerProfile.rows.length > 0) {
                userData.worker_profile = workerProfile.rows[0];
            }
        }

        return res.status(200).json({
            status: 'success',
            user: userData
        });
    } catch (error) {
        return res.status(500).json({
            status: 'error',
            message: 'Error al obtener el perfil',
            error: error.message
        });
    }
};

export const list = async (req, res) => {
    try {
        const { rows } = await pool.query(
            `SELECT p.first_name, p.last_name, p.cedula, p.phone, p.location, p.avatar_url, u.email, u.role, u.is_verified
            FROM public.profiles p
            INNER JOIN public.users u
            ON p.user_id = u.id
            WHERE u.role = 'usuario';`);
        if (!rows || rows.length === 0) {
            return res.status(404).json({
                status: "error",
                mensaje: "No se encontraron usuarios"
            });
        }
        console.log(rows);
        return res.status(200).json({
            status: 'success',
            rows
        })

    } catch (error) {
        return res.status(400).json({
            status: 'error',
            message: 'Ha ocurrido un error',
            error: error.message
        })
    }

};

export const watch = async (req, res) => {
    try {
        const { id } = req.params;

        const { rows } = await pool.query(
            `SELECT p.first_name, p.last_name, p.cedula, p.phone, p.location, p.avatar_url, u.email, u.role, u.is_verified
            FROM public.profiles p
            INNER JOIN public.users u
            ON p.user_id = u.id 
            WHERE u.id = $1;`, [id])
        if (!rows || rows.length === 0) {
            return res.status(404).json({
                status: "error",
                mensaje: "No se encontraron usuarios"
            });
        }
        return res.status(200).json({
            status: 'success',
            message: 'Usario encontrado',
            rows
        })
    } catch (error) {
        return res.status(400).json({
            status: 'error',
            message: 'Ha ocurrido un error',
            error: error.message
        })
    }
};

export const deleteUser = async (req, res) => {
    try {
        const { id } = req.params;

        const { rows, rowCount } = await pool.query(
            'SELECT delete_user_and_related_data($1)', [id]
        );
        console.log(rows);

        if (rowCount === 0) {
            return res.status(404).json({ message: 'Usuario no encontrado' });
        }

        return res.status(200).json({
            message: 'Usuario eliminado correctamente'
        });
    } catch (error) {
        console.error(error);
        return res.status(500).json({
            message: 'Error en el servidor',
            error: error.message
        });
    }
};

export const createUser = async (req, res) => {
    let client;
    try {
        client = await pool.connect();
        await client.query('BEGIN');

        const { user, worker } = normalizeUserInput(req.body);

        // Verificar si el email ya existe
        const emailExists = await checkDuplicateEmail(user.email);
        if (emailExists) {
            await client.query('ROLLBACK');
            return res.status(400).json({
                status: "error",
                message: "Ya existe un usuario con ese email",
            });
        }

        // Encriptar contraseña
        const passwordHash = await bcrypt.hash(user.password, 10);

        // Insertar en la base de datos
        const insertUser = await client.query(
            `INSERT INTO users (email, password_hash, role)
            VALUES ($1, $2, $3)
            RETURNING *`,
            [user.email, passwordHash, user.role]
        );

        const newUser = insertUser.rows[0];

        await client.query(
            `INSERT INTO profiles (user_id, first_name, last_name, cedula, phone, location)
            VALUES ($1, $2, $3, $4, $5, $6, $7)`,
            [
                newUser.id,
                user.first_name,
                user.last_name,
                user.cedula || null,
                user.phone,
                user.location || null
            ]
        );

        // Si es worker, guardamos su info adicional usando el mismo cliente
        if (worker) {
            const workerRow = await createWorker(client, newUser.id, worker);
            newUser.worker = workerRow;
        }

        await client.query('COMMIT');

        // Generar token de verificación y enlace (usando id real)
        const verificationToken = createToken({ id: newUser.id, email: newUser.email, role: newUser.role });
        const verificationLink = `http://localhost:3900/auth/verify-email?token=${verificationToken}`;

        // Intentar enviar email de verificación, pero no revertir la creación si falla
        try {
            await sendVerificationEmail(newUser.email, verificationLink);
        } catch (mailErr) {
            console.error('No se pudo enviar email de verificación:', mailErr.message || mailErr);
        }

        // Log the verification link so it can be used during testing if email delivery fails
        console.log('Verification link:', verificationLink);

        // Generar token de sesión y devolverlo
        const sessionToken = createToken({ id: newUser.id, email: newUser.email, role: newUser.role });

        // Enviar cookie HTTP-only (opcional)
        try {
            res.cookie('access_token', sessionToken, {
                httpOnly: true,
                secure: process.env.NODE_ENV === 'production',
                sameSite: 'lax',
                maxAge: 48 * 60 * 60 * 1000 // 48 horas
            });
        } catch (cookieErr) {
            // Si no se puede setear cookie, seguir devolviendo token en body
            console.error('No se pudo setear cookie de sesión:', cookieErr.message || cookieErr);
        }

        return res.status(201).json({
            message: 'Usuario agregado',
            user: newUser,
            token: sessionToken
        });
    } catch (error) {
        try { await client.query('ROLLBACK'); } catch (e) { /* ignore */ }
        return res.status(400).json({
            message: 'No se pudo insertar el usuario',
            error: error && error.message ? error.message : String(error),
        });
    } finally {
        client.release();
    }
};


export const update = async (req, res) => {
    let client;
    try {
        client = await pool.connect();
        await client.query('BEGIN');

        const { id } = req.params;

        // Normalizamos la entrada igual que en createUser
        const { user, worker } = normalizeUserInput(req.body);

        // Verificar si el usuario existe
        const userExists = await pool.query(
            `SELECT * FROM users WHERE id = $1 FOR UPDATE`, // Bloquea la fila para la actualización
            [id]
        );

        if (userExists.rowCount === 0) {
            return res.status(404).json({
                message: "El usuario no existe"
            });
        }

        // Si viene password, la encriptamos
        let passwordHash = userExists.rows[0].password_hash;
        if (user.password) {
            passwordHash = await bcrypt.hash(user.password, 10);
        }

        // Actualizar tabla users
        const updatedUserResult = await client.query(
            `UPDATE users
             SET email = $1,
                 password_hash = $2,
                 role = $3,
                 updated_at = NOW()
             WHERE id = $4
             RETURNING *`,
            [
                user.email,
                passwordHash,
                user.role,
                id
            ]
        );

        const updatedUser = updatedUserResult.rows[0];

        // Actualizar tabla profiles
        await client.query(
            `UPDATE profiles
             SET first_name = $1,
                 last_name = $2,
                 cedula = $3,
                 phone = $4,
                 location = $5,
                 updated_at = NOW()
             WHERE user_id = $7`,
            [
                user.first_name,
                user.last_name,
                user.cedula || null,
                user.phone,
                user.location || null,
                id
            ]
        );

        // Actualización extra si es worker (opcional), usando el mismo cliente
        if (worker) {
            const updatedWorker = await updateWorker(client, id, worker);
            updatedUser.worker = updatedWorker;
        }

        await client.query('COMMIT');

        return res.status(200).json({
            message: 'Usuario actualizado',
            user: updatedUser
        });

    } catch (error) {
        await client.query('ROLLBACK');
        return res.status(400).json({
            message: 'Error al actualizar el usuario',
            error: error.message
        });
    } finally {
        client.release();
    }
};
