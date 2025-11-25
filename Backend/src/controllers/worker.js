import { pool } from "../db.js";
import {validateWorkerData} from ("../helpers/validateWorker.js");

export async function createWorker(userId, worker) {
    try {
        const result = await pool.query(
            `INSERT INTO worker_profiles (id, service_description, years_experience, certification_url)
             VALUES ($1, $2, $3, $4)
             RETURNING *`,
            [
                userId,
                worker.service_description,
                worker.years_experience,
                worker.certification_url
            ]
        );

        return result.rows[0];

    } catch (error) {
        throw new Error("Error al crear el perfil de empleado: " + error.message);
    }
}

export async function list(req, res) {
    try {
        const { rows } = await pool.query(`
            SELECT u.*, e.titles, e.description, e.ocupation, e.documentation
            FROM users u
            LEFT JOIN employee e ON u.id = e.id
            WHERE role = 'employee';
        `);
        if (!rows || rows.length === 0) {
            return res.status(404).json({
                message: "No se han encontrado empleados",
                error: error.message
            })
        }
        return res.status(200).json({
            status: "succes",
            rows
        })

    } catch (error) {
        return res.status(401).json({
            message: "No se pudo ver los usuarios",
            error: error.message
        })
    }
}

export async function watch(req, res) {
    try {
        const {id} = req.params;
        if (isNaN(id)) {
            return res.status(400).json({ message: 'ID inválido' });
        }
        const { rows } = await pool.query(`
            SELECT u.*, e.titles, e.description, e.ocupation, e.documentation
            FROM users u
            LEFT JOIN employee e ON u.id = e.id
            WHERE u.id = $1 AND role = 'employee';
         `, [id]);

        if (!rows || rows.length === 0) {
            return res.status(404).json({
                message: "No se ha encontrado ningún empleado con esa identificación",
                error: error.message
            })
        }

        return res.status(200).json({
            status: "succes",
            rows
        });
    } catch (error) {
        return res.status(401).json({
            message: "Hubo un error en la consulta",
            error: error.message
        })
    }

}
export async function updateWorker(userId, worker) {
    try {
        // Validar datos del worker
        const { service_description, years_experience, certification_url } =
            validateWorkerData(worker);

        const result = await pool.query(
            `UPDATE worker_profiles
             SET service_description = $1,
                 years_experience = $2,
                 certification_url = $3
             WHERE id = $4
             RETURNING *`,
            [
                service_description,
                years_experience,
                certification_url,
                userId
            ]
        );

        return result.rows[0];

    } catch (error) {
        throw new Error("Error al actualizar el perfil de empleado: " + error.message);
    }
}
