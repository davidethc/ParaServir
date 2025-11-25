import { pool } from "../db.js";
import {validateWorkerData} from "../helpers/validateWorker.js";

export async function createWorker(client, userId, worker) {
    try {
        const result = await client.query(
            `INSERT INTO worker_profiles (user_id, service_description, years_experience, certification_url)
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
            SELECT 
                u.id, u.email, u.role, u.is_verified,
                p.full_name, p.phone, p.avatar_url, p.bio, p.location,
                wp.service_description, wp.years_experience, wp.certification_url, wp.is_active
            FROM users u
            INNER JOIN profiles p ON u.id = p.user_id
            INNER JOIN worker_profiles wp ON u.id = wp.user_id
            WHERE u.role = 'worker';
        `);

        if (!rows || rows.length === 0) {
            return res.status(404).json({
                message: "No se han encontrado empleados",
                error: error.message
            })
        }
        return res.status(200).json({
            status: "success",
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

        const { rows } = await pool.query(`            
            SELECT 
                u.id, u.email, u.role, u.is_verified,
                p.full_name, p.phone, p.avatar_url, p.bio, p.location,
                wp.service_description, wp.years_experience, wp.certification_url, wp.is_active
            FROM users u
            INNER JOIN profiles p ON u.id = p.user_id
            INNER JOIN worker_profiles wp ON u.id = wp.user_id
            WHERE u.id = $1 AND u.role = 'worker';
        `, [id]);

        if (!rows || rows.length === 0) {
            return res.status(404).json({
                message: "No se ha encontrado ningún empleado con esa identificación",
                error: error.message
            })
        }

        return res.status(200).json({
            status: "success",
            rows
        });
    } catch (error) {
        return res.status(401).json({
            message: "Hubo un error en la consulta",
            error: error.message
        })
    }

}
export async function updateWorker(client, userId, worker) {
    try {
        // Validar datos del worker
        const { service_description, years_experience, certification_url } =
            validateWorkerData(worker);

        const result = await client.query(
            `UPDATE worker_profiles
             SET service_description = $1,
                 years_experience = $2,
                 certification_url = $3
             WHERE user_id = $4
             RETURNING *`,
            [
                service_description,
                years_experience,
                certification_url,
                userId
            ]
        );

        // Si no se actualizó ninguna fila, puede que el perfil no exista.
        // Lo creamos en lugar de fallar.
        if (result.rowCount === 0) {
            const newWorkerProfile = await client.query(
                `INSERT INTO worker_profiles (user_id, service_description, years_experience, certification_url)
                 VALUES ($1, $2, $3, $4)
                 ON CONFLICT (user_id) DO NOTHING
                 RETURNING *`,
                [userId, service_description, years_experience, certification_url]
            );
            return newWorkerProfile.rows[0];
        }

        return result.rows[0];

    } catch (error) {
        throw new Error("Error al actualizar el perfil de empleado: " + error.message);
    }
}
