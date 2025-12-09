import { pool } from "../db.js";
import { validateWorkerData } from "../helpers/validateWorker.js";

export async function createWorker(client, userId, worker) {
    try {
        const result = await client.query(
            `INSERT INTO worker_profiles 
                (user_id, years_experience, certification_url, verification_status, is_active)
             VALUES ($1, $2, $3, $4, $5)
             RETURNING *`,
            [
                userId,
                worker.years_experience,
                worker.certification_url,
                worker.verification_status || 'pending',
                worker.is_active ?? true
            ]
        );

        const workerProfile = result.rows[0];

        return {
            profile: workerProfile
        };

    } catch (error) {
        throw new Error("Error al crear el perfil de empleado: " + error.message);
    }
}


export async function list(req, res) {
    try {
        const { rows } = await pool.query(`            
            SELECT 
                u.id, u.email, u.role, u.is_verified,
                p.first_name, p.last_name, p.cedula, p.phone, p.avatar_url, p.location,
                wp.years_experience, wp.certification_url, wp.verification_status, wp.is_active
            FROM users u
            INNER JOIN profiles p ON u.id = p.user_id
            INNER JOIN worker_profiles wp ON u.id = wp.user_id
            WHERE u.role = 'trabajador';
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
                p.first_name, p.last_name, p.cedula, p.phone, p.avatar_url, p.location,
                wp.years_experience, wp.certification_url, wp.verification_status, wp.is_active
            FROM users u
            INNER JOIN profiles p ON u.id = p.user_id
            INNER JOIN worker_profiles wp ON u.id = wp.user_id
            WHERE u.id = $1 AND u.role = 'trabajador';
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
        const { years_experience, certification_url, verification_status, is_active } =
            validateWorkerData(worker);

        const result = await client.query(
            `UPDATE worker_profiles
             SET years_experience = $1,
                 certification_url = $2,
                 verification_status = $3,
                 is_active = $4
             WHERE user_id = $5
             RETURNING *`,
            [
                years_experience,
                certification_url,
                verification_status,
                is_active,
                userId
            ]
        );

        if (result.rowCount === 0) {
            const newWorkerProfile = await client.query(
                `INSERT INTO worker_profiles (user_id, years_experience, certification_url, verification_status, is_active)
                 VALUES ($1, $2, $3, $4, $5)
                 ON CONFLICT (user_id) DO NOTHING
                 RETURNING *`,
                [userId, years_experience, certification_url, verification_status, is_active]
            );
            return newWorkerProfile.rows[0];
        }

        return result.rows[0];

    } catch (error) {
        throw new Error("Error al actualizar el perfil de empleado: " + error.message);
    }
}
