import { pool } from "../db.js";

/**
 * Crear una notificación
 */
export async function createNotification(userId, type, title, message, relatedId = null) {
    try {
        const result = await pool.query(
            `INSERT INTO notifications (user_id, type, title, message, related_id)
             VALUES ($1, $2, $3, $4, $5)
             RETURNING *`,
            [userId, type, title, message, relatedId]
        );
        return result.rows[0];
    } catch (error) {
        console.error('Error al crear notificación:', error);
        throw error;
    }
}

/**
 * Obtener notificaciones de un usuario
 */
export async function getUserNotifications(req, res) {
    const userId = req.user?.id;
    if (!userId) {
        return res.status(401).json({ status: "error", message: "No autenticado" });
    }

    try {
        const { unread_only = false, limit = 50 } = req.query;

        let query = `
            SELECT id, user_id, type, title, message, related_id, is_read, created_at
            FROM notifications
            WHERE user_id = $1
        `;
        const params = [userId];
        let paramIndex = 2;

        if (unread_only === 'true') {
            query += ` AND is_read = false`;
        }

        query += ` ORDER BY created_at DESC LIMIT $${paramIndex}`;
        params.push(parseInt(limit) || 50);

        const { rows } = await pool.query(query, params);

        // Contar no leídas
        const unreadCount = await pool.query(
            `SELECT COUNT(*)::int as count FROM notifications WHERE user_id = $1 AND is_read = false`,
            [userId]
        );

        return res.status(200).json({
            status: "success",
            notifications: rows,
            unread_count: unreadCount.rows[0].count
        });
    } catch (error) {
        return res.status(500).json({
            status: "error",
            message: "Error al obtener notificaciones",
            error: error.message
        });
    }
}

/**
 * Marcar notificación como leída
 */
export async function markAsRead(req, res) {
    const userId = req.user?.id;
    if (!userId) {
        return res.status(401).json({ status: "error", message: "No autenticado" });
    }

    const { id } = req.params;

    try {
        // Verificar que la notificación pertenece al usuario
        const check = await pool.query(
            `SELECT id FROM notifications WHERE id = $1 AND user_id = $2`,
            [id, userId]
        );

        if (check.rowCount === 0) {
            return res.status(404).json({
                status: "error",
                message: "Notificación no encontrada"
            });
        }

        await pool.query(
            `UPDATE notifications SET is_read = true WHERE id = $1`,
            [id]
        );

        return res.status(200).json({
            status: "success",
            message: "Notificación marcada como leída"
        });
    } catch (error) {
        return res.status(500).json({
            status: "error",
            message: "Error al marcar notificación",
            error: error.message
        });
    }
}

/**
 * Marcar todas las notificaciones como leídas
 */
export async function markAllAsRead(req, res) {
    const userId = req.user?.id;
    if (!userId) {
        return res.status(401).json({ status: "error", message: "No autenticado" });
    }

    try {
        await pool.query(
            `UPDATE notifications SET is_read = true WHERE user_id = $1 AND is_read = false`,
            [userId]
        );

        return res.status(200).json({
            status: "success",
            message: "Todas las notificaciones marcadas como leídas"
        });
    } catch (error) {
        return res.status(500).json({
            status: "error",
            message: "Error al marcar notificaciones",
            error: error.message
        });
    }
}

/**
 * Eliminar notificación
 */
export async function deleteNotification(req, res) {
    const userId = req.user?.id;
    if (!userId) {
        return res.status(401).json({ status: "error", message: "No autenticado" });
    }

    const { id } = req.params;

    try {
        // Verificar que la notificación pertenece al usuario
        const check = await pool.query(
            `SELECT id FROM notifications WHERE id = $1 AND user_id = $2`,
            [id, userId]
        );

        if (check.rowCount === 0) {
            return res.status(404).json({
                status: "error",
                message: "Notificación no encontrada"
            });
        }

        await pool.query(`DELETE FROM notifications WHERE id = $1`, [id]);

        return res.status(200).json({
            status: "success",
            message: "Notificación eliminada"
        });
    } catch (error) {
        return res.status(500).json({
            status: "error",
            message: "Error al eliminar notificación",
            error: error.message
        });
    }
}
