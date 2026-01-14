import { pool } from "../db.js";
import { createNotification } from "./notification.js";

/**
 * Obtener trabajadores pendientes de verificación
 * GET /admin/workers/pending
 */
export async function getPendingWorkers(req, res) {
    const { role } = req.user;
    
    if (role !== 'admin') {
        return res.status(403).json({
            status: "error",
            message: "Solo los administradores pueden acceder a esta función"
        });
    }

    try {
        const { rows } = await pool.query(
            `SELECT 
                u.id, u.email, u.role, u.is_verified,
                p.first_name, p.last_name, p.cedula, p.phone, p.avatar_url, p.location,
                wp.years_experience, wp.certification_url, wp.verification_status, wp.is_active,
                wp.created_at as profile_created_at
            FROM users u
            INNER JOIN profiles p ON u.id = p.user_id
            INNER JOIN worker_profiles wp ON u.id = wp.user_id
            WHERE u.role = 'trabajador'
                AND wp.verification_status = 'pending'
            ORDER BY wp.created_at ASC`
        );

        return res.status(200).json({
            status: "success",
            workers: rows,
            count: rows.length
        });
    } catch (error) {
        return res.status(500).json({
            status: "error",
            message: "Error al obtener trabajadores pendientes",
            error: error.message
        });
    }
}

/**
 * Aprobar o rechazar verificación de trabajador
 * PUT /admin/workers/:id/verify
 */
export async function verifyWorker(req, res) {
    const { role } = req.user;
    const { id } = req.params;
    const { action } = req.body; // 'approve' o 'reject'

    if (role !== 'admin') {
        return res.status(403).json({
            status: "error",
            message: "Solo los administradores pueden realizar esta acción"
        });
    }

    if (!['approve', 'reject'].includes(action)) {
        return res.status(400).json({
            status: "error",
            message: "La acción debe ser 'approve' o 'reject'"
        });
    }

    const client = await pool.connect();
    try {
        await client.query('BEGIN');

        // Verificar que el trabajador existe
        const workerCheck = await client.query(
            `SELECT user_id FROM worker_profiles WHERE user_id = $1`,
            [id]
        );

        if (workerCheck.rowCount === 0) {
            await client.query('ROLLBACK');
            return res.status(404).json({
                status: "error",
                message: "Trabajador no encontrado"
            });
        }

        const verificationStatus = action === 'approve' ? 'verified' : 'rejected';

        // Actualizar estado de verificación
        await client.query(
            `UPDATE worker_profiles 
             SET verification_status = $1, updated_at = NOW()
             WHERE user_id = $2`,
            [verificationStatus, id]
        );

        // Crear notificación para el trabajador
        try {
            await createNotification(
                id,
                'verification_status',
                action === 'approve' ? 'Verificación Aprobada' : 'Verificación Rechazada',
                action === 'approve' 
                    ? 'Tu perfil de trabajador ha sido verificado. ¡Ya puedes recibir solicitudes!'
                    : 'Tu solicitud de verificación ha sido rechazada. Por favor, revisa tu información y vuelve a intentar.',
                null
            );
        } catch (notifError) {
            console.error('Error al crear notificación:', notifError);
        }

        // Registrar acción del admin
        await client.query(
            `INSERT INTO admin_actions (admin_id, action, details)
             VALUES ($1, $2, $3)`,
            [
                req.user.id,
                `worker_verification_${action}`,
                `Trabajador ${id}: ${verificationStatus}`
            ]
        );

        await client.query('COMMIT');

        return res.status(200).json({
            status: "success",
            message: `Verificación ${action === 'approve' ? 'aprobada' : 'rechazada'} correctamente`,
            verification_status: verificationStatus
        });
    } catch (error) {
        await client.query('ROLLBACK');
        return res.status(500).json({
            status: "error",
            message: "Error al procesar la verificación",
            error: error.message
        });
    } finally {
        client.release();
    }
}

/**
 * Dashboard de administrador - Estadísticas
 * GET /admin/dashboard
 */
export async function getAdminDashboard(req, res) {
    const { role } = req.user;
    
    if (role !== 'admin') {
        return res.status(403).json({
            status: "error",
            message: "Solo los administradores pueden acceder a esta función"
        });
    }

    try {
        // Estadísticas generales
        const [
            totalUsers,
            totalWorkers,
            totalRequests,
            pendingVerifications,
            totalReviews
        ] = await Promise.all([
            pool.query("SELECT COUNT(*)::int as count FROM users WHERE role = 'usuario'"),
            pool.query("SELECT COUNT(*)::int as count FROM worker_profiles"),
            pool.query("SELECT COUNT(*)::int as count FROM service_requests"),
            pool.query("SELECT COUNT(*)::int as count FROM worker_profiles WHERE verification_status = 'pending'"),
            pool.query("SELECT COUNT(*)::int as count FROM reviews")
        ]);

        return res.status(200).json({
            status: "success",
            stats: {
                total_users: totalUsers.rows[0].count,
                total_workers: totalWorkers.rows[0].count,
                total_requests: totalRequests.rows[0].count,
                pending_verifications: pendingVerifications.rows[0].count,
                total_reviews: totalReviews.rows[0].count
            }
        });
    } catch (error) {
        return res.status(500).json({
            status: "error",
            message: "Error al obtener estadísticas",
            error: error.message
        });
    }
}
