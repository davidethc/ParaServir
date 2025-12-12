import { pool } from "../db.js";

// Crear una reseña
export const createReview = async (req, res) => {
    const clientId = req.user?.id;

    const { request_id, rating, comment } = req.body;

    if (!request_id || !rating) {
        return res.status(400).json({
            status: "error",
            message: "request_id y rating son requeridos"
        });
    }

    if (rating < 1 || rating > 5) {
        return res.status(400).json({
            status: "error",
            message: "El rating debe estar entre 1 y 5"
        });
    }

    let client;
    try {
        client = await pool.connect();
        await client.query("BEGIN");

        // Verificar que la solicitud existe y pertenece al cliente
        const requestCheck = await client.query(
            "SELECT client_id, worker_id, status FROM service_requests WHERE id = $1",
            [request_id]
        );

        if (requestCheck.rowCount === 0) {
            await client.query("ROLLBACK");
            return res.status(404).json({
                status: "error",
                message: "Solicitud no encontrada"
            });
        }

        const request = requestCheck.rows[0];

        // Solo el cliente puede crear una reseña
        if (request.client_id !== clientId) {
            await client.query("ROLLBACK");
            return res.status(403).json({
                status: "error",
                message: "Solo el cliente puede crear una reseña para esta solicitud"
            });
        }

        // Verificar que la solicitud esté completada
        if (request.status !== 'completed') {
            await client.query("ROLLBACK");
            return res.status(400).json({
                status: "error",
                message: "Solo se pueden crear reseñas para solicitudes completadas"
            });
        }

        // Verificar que no existe ya una reseña para esta solicitud
        const existingReview = await client.query(
            "SELECT id FROM reviews WHERE request_id = $1",
            [request_id]
        );

        if (existingReview.rowCount > 0) {
            await client.query("ROLLBACK");
            return res.status(400).json({
                status: "error",
                message: "Ya existe una reseña para esta solicitud"
            });
        }

        const result = await client.query(
            `INSERT INTO reviews (request_id, client_id, worker_id, rating, comment)
             VALUES ($1, $2, $3, $4, $5)
             RETURNING *`,
            [request_id, clientId, request.worker_id, rating, comment || null]
        );

        await client.query("COMMIT");

        return res.status(201).json({
            status: "success",
            message: "Reseña creada",
            review: result.rows[0]
        });
    } catch (error) {
        try { await client.query("ROLLBACK"); } catch (_) {}
        return res.status(400).json({
            status: "error",
            message: "No se pudo crear la reseña",
            error: error.message
        });
    } finally {
        client.release();
    }
};

// Obtener reseñas de un trabajador
export const getWorkerReviews = async (req, res) => {
    const { workerId } = req.params;

    try {
        const { rows } = await pool.query(
            `SELECT r.*,
                    u.email as client_email,
                    p.first_name as client_first_name,
                    p.last_name as client_last_name,
                    p.avatar_url as client_avatar,
                    sr.description as request_description
             FROM reviews r
             INNER JOIN users u ON r.client_id = u.id
             INNER JOIN profiles p ON u.id = p.user_id
             INNER JOIN service_requests sr ON r.request_id = sr.id
             WHERE r.worker_id = $1
             ORDER BY r.created_at DESC`,
            [workerId]
        );

        // Calcular promedio de rating
        const avgRating = rows.length > 0
            ? rows.reduce((sum, r) => sum + r.rating, 0) / rows.length
            : 0;

        return res.status(200).json({
            status: "success",
            reviews: rows,
            average_rating: parseFloat(avgRating.toFixed(2)),
            total_reviews: rows.length
        });
    } catch (error) {
        return res.status(500).json({
            status: "error",
            message: "Error al obtener las reseñas",
            error: error.message
        });
    }
};

// Obtener reseña de una solicitud específica
export const getRequestReview = async (req, res) => {
    const { requestId } = req.params;

    try {
        const { rows } = await pool.query(
            `SELECT r.*,
                    u.email as client_email,
                    p.first_name as client_first_name,
                    p.last_name as client_last_name,
                    p.avatar_url as client_avatar
             FROM reviews r
             INNER JOIN users u ON r.client_id = u.id
             INNER JOIN profiles p ON u.id = p.user_id
             WHERE r.request_id = $1`,
            [requestId]
        );

        if (rows.length === 0) {
            return res.status(404).json({
                status: "error",
                message: "No se encontró reseña para esta solicitud"
            });
        }

        return res.status(200).json({
            status: "success",
            review: rows[0]
        });
    } catch (error) {
        return res.status(500).json({
            status: "error",
            message: "Error al obtener la reseña",
            error: error.message
        });
    }
};

// Actualizar reseña
export const updateReview = async (req, res) => {
    const userId = req.user?.id;

    const { id } = req.params;
    const { rating, comment } = req.body;

    if (rating !== undefined && (rating < 1 || rating > 5)) {
        return res.status(400).json({
            status: "error",
            message: "El rating debe estar entre 1 y 5"
        });
    }

    try {
        // Verificar que la reseña existe y pertenece al usuario
        const reviewCheck = await pool.query(
            "SELECT client_id FROM reviews WHERE id = $1",
            [id]
        );

        if (reviewCheck.rowCount === 0) {
            return res.status(404).json({
                status: "error",
                message: "Reseña no encontrada"
            });
        }

        if (reviewCheck.rows[0].client_id !== userId) {
            return res.status(403).json({
                status: "error",
                message: "Solo puedes actualizar tus propias reseñas"
            });
        }

        // Construir query de actualización
        const updates = [];
        const values = [];
        let paramIndex = 1;

        if (rating !== undefined) {
            updates.push(`rating = $${paramIndex++}`);
            values.push(rating);
        }
        if (comment !== undefined) {
            updates.push(`comment = $${paramIndex++}`);
            values.push(comment);
        }

        if (updates.length === 0) {
            return res.status(400).json({
                status: "error",
                message: "No se proporcionaron campos para actualizar"
            });
        }

        values.push(id);

        const updateQuery = `
            UPDATE reviews 
            SET ${updates.join(', ')}
            WHERE id = $${paramIndex}
            RETURNING *
        `;

        const result = await pool.query(updateQuery, values);

        return res.status(200).json({
            status: "success",
            message: "Reseña actualizada",
            review: result.rows[0]
        });
    } catch (error) {
        return res.status(400).json({
            status: "error",
            message: "No se pudo actualizar la reseña",
            error: error.message
        });
    }
};

// Eliminar reseña
export const deleteReview = async (req, res) => {
    const userId = req.user?.id;
    if (!userId) {
        return res.status(401).json({ status: "error", message: "No autenticado" });
    }

    const { id } = req.params;
    const { role } = req.user;

    try {
        // Verificar que la reseña existe
        const reviewCheck = await pool.query(
            "SELECT client_id FROM reviews WHERE id = $1",
            [id]
        );

        if (reviewCheck.rowCount === 0) {
            return res.status(404).json({
                status: "error",
                message: "Reseña no encontrada"
            });
        }

        // Solo el cliente que creó la reseña o admin pueden eliminarla
        if (reviewCheck.rows[0].client_id !== userId && role !== 'admin') {
            return res.status(403).json({
                status: "error",
                message: "Solo puedes eliminar tus propias reseñas"
            });
        }

        const result = await pool.query(
            "DELETE FROM reviews WHERE id = $1 RETURNING id",
            [id]
        );

        return res.status(200).json({
            status: "success",
            message: "Reseña eliminada correctamente",
            deleted_id: result.rows[0].id
        });
    } catch (error) {
        return res.status(500).json({
            status: "error",
            message: "Error al eliminar la reseña",
            error: error.message
        });
    }
};
