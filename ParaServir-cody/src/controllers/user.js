import { pool } from "../db.js";
import { checkDuplicateEmail } from "../helpers/checkDuplicateEmail.js";
import bcrypt from "bcrypt";
import { createWorker, updateWorker } from "./worker.js";
import { normalizeUserInput } from "../helpers/normalizeUser.js";
import { validateUserUpdateData } from "../helpers/validateUser.js";
import { sendVerificationEmail } from "../helpers/mail.js";
import { createToken } from "../helpers/jwt.js";

export const getMe = async (req, res) => {
    try {
        const userId = req.user?.id;
        
        if (!userId) {
            return res.status(401).json({
                status: "error",
                message: "No autenticado"
            });
        }

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
    const client = await pool.connect();
    try {
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
            `INSERT INTO profiles (user_id, first_name, last_name, cedula, phone, location, avatar_url)
            VALUES ($1, $2, $3, $4, $5, $6, $7)`,
            [
                newUser.id,
                user.first_name,
                user.last_name,
                user.cedula || null,
                user.phone,
                user.location || null,
                user.avatar_url || null
            ]
        );

        // Si es worker, guardamos su info adicional usando el mismo cliente
        if (worker) {
            const workerRow = await createWorker(client, newUser.id, worker);
            newUser.worker = workerRow;
        }

        await client.query('COMMIT');

        // Generar token de verificación y enlace (usando id real)
        const verificationToken = createToken({ id: newUser.id, email: newUser.email });
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
        const sessionToken = createToken({ id: newUser.id, email: newUser.email });

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
    const client = await pool.connect();
    try {
        await client.query('BEGIN');

        const { id } = req.params;
        const userId = req.user?.id; // ID del usuario autenticado

        // SEGURIDAD: Solo puede editar su propio perfil
        if (userId !== id) {
            await client.query('ROLLBACK');
            return res.status(403).json({
                status: "error",
                message: "No tienes permiso para editar este perfil"
            });
        }

        // Verificar si el usuario existe primero
        const userExists = await pool.query(
            `SELECT * FROM users WHERE id = $1 FOR UPDATE`, // Bloquea la fila para la actualización
            [id]
        );

        if (userExists.rowCount === 0) {
            await client.query('ROLLBACK');
            return res.status(404).json({
                status: "error",
                message: "El usuario no existe"
            });
        }

        // SEGURIDAD: No permitir cambiar el role (solo admins pueden hacerlo)
        // El role se mantiene igual al que ya tiene el usuario
        const currentRole = userExists.rows[0].role;

        // Validar datos de actualización (password es opcional)
        const user = validateUserUpdateData(req.body);

        // Si viene password, la encriptamos
        let passwordHash = userExists.rows[0].password_hash;
        if (user.password && user.password.length > 0) {
            passwordHash = await bcrypt.hash(user.password, 10);
        }

        // Actualizar tabla users (SIN cambiar el role)
        const updatedUserResult = await client.query(
            `UPDATE users
             SET email = $1,
                 password_hash = $2
             WHERE id = $3
             RETURNING *`,
            [
                user.email,
                passwordHash,
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
                 avatar_url = $6
             WHERE user_id = $7`,
            [
                user.first_name,
                user.last_name,
                user.cedula || null,
                user.phone,
                user.location || null,
                user.avatar_url || null,
                id
            ]
        );

        // NO actualizar perfil de worker aquí - eso se hace en /workers/profile
        // El perfil profesional se gestiona por separado para mantener separación de responsabilidades

        await client.query('COMMIT');
        client.release(); // Liberar el cliente antes de hacer consultas adicionales

        // Obtener datos completos del usuario actualizado (incluyendo profile)
        const { rows: profileRows } = await pool.query(
            `SELECT first_name, last_name, cedula, phone, location, avatar_url
             FROM profiles WHERE user_id = $1`,
            [id]
        );

        // Si es trabajador, incluir información del perfil profesional
        let workerProfile = undefined;
        if (currentRole === 'trabajador') {
            const workerProfileResult = await pool.query(
                `SELECT years_experience, certification_url, verification_status, is_active
                 FROM worker_profiles
                 WHERE user_id = $1`,
                [id]
            );
            if (workerProfileResult.rows.length > 0) {
                workerProfile = workerProfileResult.rows[0];
            }
        }

        const updatedUserData = {
            id: updatedUserResult.rows[0].id,
            email: updatedUserResult.rows[0].email,
            role: updatedUserResult.rows[0].role,
            is_verified: updatedUserResult.rows[0].is_verified,
            created_at: updatedUserResult.rows[0].created_at,
            first_name: profileRows[0]?.first_name || null,
            last_name: profileRows[0]?.last_name || null,
            cedula: profileRows[0]?.cedula || null,
            phone: profileRows[0]?.phone || null,
            location: profileRows[0]?.location || null,
            avatar_url: profileRows[0]?.avatar_url || null,
            worker_profile: workerProfile
        };

        return res.status(200).json({
            status: "success",
            message: 'Usuario actualizado',
            user: updatedUserData
        });

    } catch (error) {
        try {
            await client.query('ROLLBACK');
        } catch (rollbackError) {
            // Ignorar errores de rollback
        }
        client.release();
        return res.status(400).json({
            status: "error",
            message: 'Error al actualizar el usuario',
            error: error.message
        });
    }
};
