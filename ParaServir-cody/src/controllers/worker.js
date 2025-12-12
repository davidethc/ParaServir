import { pool } from "../db.js";
import {validateWorkerData} from "../helpers/validateWorker.js";

export async function createWorker(client, userId, worker) {
    try {
        const result = await client.query(
            `INSERT INTO worker_profiles (user_id, years_experience, certification_url, verification_status, is_active)
             VALUES ($1, $2, $3, $4, $5)
             RETURNING *`,
            [
                userId,
                worker.years_experience,
                worker.certification_url,
                worker.verification_status || 'pending',
                worker.is_active == null ? true : worker.is_active
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

        if(!id){
            return res.staus(400).json({
                status:"error",
                message:"Se requiere el ID del trabajador"
            })
        }

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

// Crear o actualizar el perfil del trabajador (años experiencia, certificación, estado)
export async function upsertProfile(req, res) {
    const userId = req.user?.id;
    try {
        const validated = validateWorkerData(req.body || {});
        const years_experience = validated.years_experience;
        const certification_url = validated.certification_url;
        const verification_status = validated.verification_status || "pending";
        const is_active = validated.is_active;

        const result = await pool.query(
            `INSERT INTO worker_profiles (user_id, years_experience, certification_url, verification_status, is_active)
             VALUES ($1, $2, $3, $4, $5)
             ON CONFLICT (user_id) DO UPDATE
             SET years_experience = EXCLUDED.years_experience,
                 certification_url = EXCLUDED.certification_url,
                 verification_status = EXCLUDED.verification_status,
                 is_active = EXCLUDED.is_active
             RETURNING *`,
            [userId, years_experience, certification_url, verification_status, is_active]
        );

        return res.status(200).json({
            status: "success",
            profile: result.rows[0]
        });
    } catch (error) {
        return res.status(400).json({
            status: "error",
            message: "No se pudo actualizar el perfil de trabajador",
            error: error.message
        });
    }
};

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

// Obtener servicios de un trabajador
export async function getWorkerServices(req, res) {
    try {
        const { id } = req.params;

        const { rows } = await pool.query(
            `SELECT ws.id, ws.title, ws.description, ws.base_price, 
                    ws.is_available, ws.created_at, ws.updated_at,
                    sc.id as category_id, sc.name as category_name, sc.icon as category_icon
             FROM worker_services ws
             INNER JOIN service_categories sc ON ws.category_id = sc.id
             WHERE ws.worker_id = $1
             ORDER BY ws.created_at DESC`,
            [id]
        );

        return res.status(200).json({
            status: 'success',
            services: rows
        });
    } catch (error) {
        return res.status(500).json({
            status: 'error',
            message: 'Error al obtener los servicios',
            error: error.message
        });
    }
};