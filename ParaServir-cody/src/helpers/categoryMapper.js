import { pool } from "../db.js";

export const findCategoryId = async (input) => {
    try {
        if (!input) return null;

        // Patrón para validar UUID
        const uuidPattern = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

        // Si es UUID válido, buscarlo directamente en BD
        if (typeof input === 'string' && uuidPattern.test(input)) {
            const { rows } = await pool.query(
                "SELECT id FROM service_categories WHERE id = $1 LIMIT 1",
                [input]
            );
            return rows.length > 0 ? rows[0].id : null;
        }

        // Si no es UUID, buscar por nombre (case-insensitive)
        const { rows } = await pool.query(
            "SELECT id FROM service_categories WHERE LOWER(name) = LOWER($1) LIMIT 1",
            [input]
        );

        return rows.length > 0 ? rows[0].id : null;
    } catch (err) {
        console.error('Error en findCategoryId:', err.message);
        return null;
    }
};
