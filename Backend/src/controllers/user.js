import { pool } from "../db.js";
import { validateUserData } from "../helpers/validateUser.js";
import { checkDuplicateEmail } from "../helpers/checkDuplicateEmail.js";
import bcrypt from "bcrypt";
import { createEmployee } from "./employee.js";
import { normalizeUserInput } from "../helpers/normalizeUser.js";

export const list = async (req, res) => {
    try {
        const { rows } = await pool.query('SELECT id, name, surname, email, role, created_at, image FROM users;');
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
        const { rows } = await pool.query('SELECT id, name, surname, email, role, created_at, image FROM users WHERE id = $1;', [id])
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
            'DELETE FROM users WHERE id = $1 RETURNING *',
            [id]
        );

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
        const { user, employee } = normalizeUserInput(req.body);


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
            "INSERT INTO users (name, surname, email, password, role) VALUES ($1, $2, $3, $4, $5) RETURNING *",
            [user.name, user.surname, user.email, passwordHash, user.role]
        );

        const newUser = result.rows[0];

        // Si es employee, guardamos su info adicional
        if (employee) {
            const employeeRow = await createEmployee(newUser.id, employee);
            newUser.employee = employeeRow;
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
        const { name, email, password } = validateUserData(req.body);

        const passwordHash = await bcrypt.hash(password, 10);

        const result = await pool.query('UPDATE users SET name= $1, surname= $2, email=%3, password= $4, role= %5 WHERE id= $6 RETURNING *;',
            [name, surname, email, passwordHash, role, id]
        )
        return res.status(200).json({
            message: 'Usuario actualizado',
            user: result.rows[0]
        })
    } catch (error) {
        return res.status(400).json({
            message: 'Error al actualizar el usuario',
            error: error.message
        })
    }
}
