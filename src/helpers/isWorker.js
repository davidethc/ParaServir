import { pool } from "../db.js";


export const isWorker = async (userId) => {
    if (!userId) return false;

    try {
        const { rows } = await pool.query(
            `SELECT role FROM users WHERE id = $1`,
            [userId]
        );

        if (!rows || rows.length === 0) return false;

        const role = rows[0].role;
        if (role) {
            const r = String(role).toLowerCase();
            if (r === 'trabajador') return true;
        }

        // Si role no indica worker, comprobamos tabla worker_profiles
        const { rowCount } = await pool.query(
            `SELECT 1 FROM worker_profiles WHERE user_id = $1 LIMIT 1`,
            [userId]
        );

        return rowCount > 0;
    } catch (error) {
        console.error( error && error.message ? error.message : error);
        return false;
    }
};
