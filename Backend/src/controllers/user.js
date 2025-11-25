import { pool } from "../db.js";
import { validateUserData } from "../helpers/validateUser.js";
import { checkDuplicateEmail } from "../helpers/checkDuplicateEmail.js";
import bcrypt from "bcrypt";
import { createWorker } from "./worker.js";
import { normalizeUserInput } from "../helpers/normalizeUser.js";

export const list = async (req, res) => {
    try {
        const { rows } = await pool.query(
            `SELECT p.*, u.email, u.role, u.is_verified
            FROM public.profiles p
            INNER JOIN public.users u
            ON p.user_id = u.id;`);
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
        if (isNaN(id)) {
            return res.status(400).json({ message: 'ID inválido' });
        }
        const { rows } = await pool.query(
            `SELECT p.*, u.email, u.role, u.is_verified
            FROM public.profiles p
            INNER JOIN public.users u
            ON p.user_id = u.id 
            WHERE id = $1;`, [id])
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

        if (isNaN(id)) {
            return res.status(400).json({ message: 'ID inválido' });
        }

        const { rows, rowCount } = await pool.query(
            'SELECT delete_user_and_related_data($1)', [id]
        );
        console.log(rows);

        if (rowCount === 0) {
            return res.status(404).json({ message: 'Usuario no encontrado' });
        }

        return res.status(200).json({
            message: 'Usuario eliminado correctamente',
            user: rows[0]
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
    try {
        const { user, worker } = normalizeUserInput(req.body);


        // Luego verificar si el email ya existe
        const emailExists = await checkDuplicateEmail(user.email);
        if (emailExists) {
            return res.status(400).json({
                status: "error",
                message: "Ya existe un usuario con ese email",
            });
        }

        // Encriptar contraseña
        const passwordHash = await bcrypt.hash(user.password, 10);

        // Insertar en la base de datos
        const result = await pool.query(
            `INSERT INTO users (email, password_hash, role)
            VALUES ($1, $2, $3)
            RETURNING *`,
            [user.email, passwordHash, user.role]
        );

        const newUser = result.rows[0]; // usuario recién creado

        await pool.query(
            `INSERT INTO profiles (user_id, full_name, phone, bio, location)
            VALUES ($1, $2, $3, $4, $5, $6)`,
            [
                newUser.id,
                user.fullname,
                user.phone,
                user.bio || null,
                user.location
            ]
        );

        // Si es worker, guardamos su info adicional
        if (worker) {
            const workerRow = await createWorker(newUser.id, worker);
            newUser.worker = workerRow;
        }

        // Respuesta final
        return res.status(201).json({
            message: "Usuario agregado",
            user: newUser
        });
    } catch (error) {
        return res.status(400).json({
            message: "No se pudo insertar el usuario",
            error: error.message,
        });
    }
};


export const update = async (req, res) => {
    try {
        const { id } = req.params;

        if (isNaN(id)) {
            return res.status(400).json({ message: 'ID inválido' });
        }

        // Normalizamos la entrada igual que en createUser
        const { user, worker } = normalizeUserInput(req.body);

        // Verificar si el usuario existe
        const userExists = await pool.query(
            `SELECT * FROM users WHERE id = $1`,
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
        const updatedUserResult = await pool.query(
            `UPDATE users
             SET email = $1,
                 password_hash = $2,
                 role = $3
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
        await pool.query(
            `UPDATE profiles
             SET full_name = $1,
                 phone = $2,
                 bio = $3,
                 location = $4
             WHERE user_id = $5`,
            [
                user.fullname,
                user.phone,
                user.bio || null,
                user.location,
                id
            ]
        );

        // Actualización extra si es worker (opcional)
        if (worker) {
            const updatedWorker = await updateWorker(id, worker);
            updatedUser.worker = updatedWorker;
        }

        return res.status(200).json({
            message: 'Usuario actualizado',
            user: updatedUser
        });

    } catch (error) {
        return res.status(400).json({
            message: 'Error al actualizar el usuario',
            error: error.message
        });
    }
};
