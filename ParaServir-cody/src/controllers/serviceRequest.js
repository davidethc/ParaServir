import { pool } from "../db.js";

// Crear una solicitud de servicio
export const createRequest = async (req, res) => {
    const clientId = req.user?.id;
    if (!clientId) {
        return res.status(401).json({ status: "error", message: "No autenticado" });
    }

    const { worker_id, service_id, category_id, description, address, scheduled_date } = req.body;

    if (!description || !category_id) {
        return res.status(400).json({
            status: "error",
            message: "description y category_id son requeridos"
        });
    }

    const client = await pool.connect();
    try {
        await client.query("BEGIN");

        // Verificar que la categoría existe
        const categoryCheck = await client.query(
            "SELECT id FROM service_categories WHERE id = $1",
            [category_id]
        );
        if (categoryCheck.rowCount === 0) {
            await client.query("ROLLBACK");
            return res.status(400).json({
                status: "error",
                message: "Categoría no encontrada"
            });
        }

        // Si viene service_id, verificar que existe y pertenece al worker_id
        if (service_id) {
            const serviceCheck = await client.query(
                "SELECT worker_id FROM worker_services WHERE id = $1",
                [service_id]
            );
            if (serviceCheck.rowCount === 0) {
                await client.query("ROLLBACK");
                return res.status(400).json({
                    status: "error",
                    message: "Servicio no encontrado"
                });
            }
            if (worker_id && serviceCheck.rows[0].worker_id !== worker_id) {
                await client.query("ROLLBACK");
                return res.status(400).json({
                    status: "error",
                    message: "El servicio no pertenece al trabajador especificado"
                });
            }
        }

        // Si viene worker_id, verificar que existe y es trabajador
        if (worker_id) {
            const workerCheck = await client.query(
                "SELECT id, role FROM users WHERE id = $1",
                [worker_id]
            );
            if (workerCheck.rowCount === 0 || workerCheck.rows[0].role !== 'trabajador') {
                await client.query("ROLLBACK");
                return res.status(400).json({
                    status: "error",
                    message: "Trabajador no encontrado o inválido"
                });
            }
        }

        const result = await client.query(
            `INSERT INTO service_requests 
             (client_id, worker_id, service_id, category_id, description, address, scheduled_date, status)
             VALUES ($1, $2, $3, $4, $5, $6, $7, 'pending')
             RETURNING *`,
            [clientId, worker_id || null, service_id || null, category_id, description, address || null, scheduled_date || null]
        );

        await client.query("COMMIT");

        return res.status(201).json({
            status: "success",
            message: "Solicitud creada",
            request: result.rows[0]
        });
    } catch (error) {
        try { await client.query("ROLLBACK"); } catch (_) {}
        return res.status(400).json({
            status: "error",
            message: "No se pudo crear la solicitud",
            error: error.message
        });
    } finally {
        client.release();
    }
};

// Listar solicitudes (con filtros)
export const listRequests = async (req, res) => {
    const userId = req.user?.id;
    if (!userId) {
        return res.status(401).json({ status: "error", message: "No autenticado" });
    }

    const { role } = req.user;
    const { status, as_client, as_worker } = req.query;

    try {
        let query = `
            SELECT sr.*,
                   c.email as client_email,
                   c.role as client_role,
                   w.email as worker_email,
                   w.role as worker_role,
                   sc.name as category_name,
                   ws.title as service_title
            FROM service_requests sr
            INNER JOIN users c ON sr.client_id = c.id
            LEFT JOIN users w ON sr.worker_id = w.id
            INNER JOIN service_categories sc ON sr.category_id = sc.id
            LEFT JOIN worker_services ws ON sr.service_id = ws.id
            WHERE 1=1
        `;
        const params = [];
        let paramIndex = 1;

        // Filtrar según el rol del usuario
        if (role === 'usuario' || as_client === 'true') {
            query += ` AND sr.client_id = $${paramIndex++}`;
            params.push(userId);
        } else if (role === 'trabajador' || as_worker === 'true') {
            query += ` AND sr.worker_id = $${paramIndex++}`;
            params.push(userId);
        } else if (role === 'admin') {
            // Admin ve todas las solicitudes
        } else {
            // Si no tiene rol específico, solo ver las suyas como cliente
            query += ` AND sr.client_id = $${paramIndex++}`;
            params.push(userId);
        }

        // Filtro por estado
        if (status) {
            query += ` AND sr.status = $${paramIndex++}`;
            params.push(status);
        }

        query += ` ORDER BY sr.created_at DESC`;

        const { rows } = await pool.query(query, params);

        return res.status(200).json({
            status: "success",
            requests: rows
        });
    } catch (error) {
        return res.status(500).json({
            status: "error",
            message: "Error al obtener las solicitudes",
            error: error.message
        });
    }
};

// Ver solicitud específica
export const getRequest = async (req, res) => {
    const userId = req.user?.id;
    if (!userId) {
        return res.status(401).json({ status: "error", message: "No autenticado" });
    }

    const { id } = req.params;
    const { role } = req.user;

    try {
        const { rows } = await pool.query(
            `SELECT sr.*,
                    c.id as client_id, c.email as client_email,
                    p_c.first_name as client_first_name, p_c.last_name as client_last_name,
                    p_c.phone as client_phone, p_c.location as client_location,
                    w.id as worker_id, w.email as worker_email,
                    p_w.first_name as worker_first_name, p_w.last_name as worker_last_name,
                    p_w.phone as worker_phone, p_w.location as worker_location,
                    sc.name as category_name, sc.icon as category_icon,
                    ws.title as service_title, ws.description as service_description, ws.base_price
             FROM service_requests sr
             INNER JOIN users c ON sr.client_id = c.id
             INNER JOIN profiles p_c ON c.id = p_c.user_id
             LEFT JOIN users w ON sr.worker_id = w.id
             LEFT JOIN profiles p_w ON w.id = p_w.user_id
             INNER JOIN service_categories sc ON sr.category_id = sc.id
             LEFT JOIN worker_services ws ON sr.service_id = ws.id
             WHERE sr.id = $1`,
            [id]
        );

        if (rows.length === 0) {
            return res.status(404).json({
                status: "error",
                message: "Solicitud no encontrada"
            });
        }

        const request = rows[0];

        // Verificar permisos: solo el cliente, el trabajador asignado o admin pueden ver
        if (role !== 'admin' && request.client_id !== userId && request.worker_id !== userId) {
            return res.status(403).json({
                status: "error",
                message: "No tienes permisos para ver esta solicitud"
            });
        }

        return res.status(200).json({
            status: "success",
            request: request
        });
    } catch (error) {
        return res.status(500).json({
            status: "error",
            message: "Error al obtener la solicitud",
            error: error.message
        });
    }
};

// Actualizar estado de solicitud
export const updateRequest = async (req, res) => {
    const userId = req.user?.id;
    if (!userId) {
        return res.status(401).json({ status: "error", message: "No autenticado" });
    }

    const { id } = req.params;
    const { status, worker_id, scheduled_date, address } = req.body;
    const { role } = req.user;

    const client = await pool.connect();
    try {
        await client.query("BEGIN");

        // Obtener la solicitud actual
        const currentRequest = await client.query(
            "SELECT * FROM service_requests WHERE id = $1",
            [id]
        );

        if (currentRequest.rowCount === 0) {
            await client.query("ROLLBACK");
            return res.status(404).json({
                status: "error",
                message: "Solicitud no encontrada"
            });
        }

        const request = currentRequest.rows[0];

        // Verificar permisos
        const canUpdate = 
            role === 'admin' ||
            (role === 'trabajador' && request.worker_id === userId) ||
            (role === 'usuario' && request.client_id === userId);

        if (!canUpdate) {
            await client.query("ROLLBACK");
            return res.status(403).json({
                status: "error",
                message: "No tienes permisos para actualizar esta solicitud"
            });
        }

        // Validar cambios de estado
        if (status) {
            const validStatuses = ['pending', 'accepted', 'in_progress', 'completed', 'cancelled'];
            if (!validStatuses.includes(status)) {
                await client.query("ROLLBACK");
                return res.status(400).json({
                    status: "error",
                    message: `Estado inválido. Debe ser uno de: ${validStatuses.join(', ')}`
                });
            }

            // Reglas de negocio para cambios de estado
            if (status === 'accepted' && request.status !== 'pending') {
                await client.query("ROLLBACK");
                return res.status(400).json({
                    status: "error",
                    message: "Solo se puede aceptar una solicitud en estado 'pending'"
                });
            }

            if (status === 'cancelled' && request.status === 'completed') {
                await client.query("ROLLBACK");
                return res.status(400).json({
                    status: "error",
                    message: "No se puede cancelar una solicitud completada"
                });
            }
        }

        // Si un trabajador acepta, asignar worker_id si no está asignado
        if (status === 'accepted' && role === 'trabajador' && !request.worker_id) {
            await client.query(
                "UPDATE service_requests SET worker_id = $1 WHERE id = $2",
                [userId, id]
            );
        }

        // Construir query de actualización
        const updates = [];
        const values = [];
        let paramIndex = 1;

        if (status !== undefined) {
            updates.push(`status = $${paramIndex++}`);
            values.push(status);
        }
        if (worker_id !== undefined && role === 'admin') {
            updates.push(`worker_id = $${paramIndex++}`);
            values.push(worker_id);
        }
        if (scheduled_date !== undefined) {
            updates.push(`scheduled_date = $${paramIndex++}`);
            values.push(scheduled_date);
        }
        if (address !== undefined) {
            updates.push(`address = $${paramIndex++}`);
            values.push(address);
        }

        if (updates.length === 0) {
            await client.query("ROLLBACK");
            return res.status(400).json({
                status: "error",
                message: "No se proporcionaron campos para actualizar"
            });
        }

        updates.push(`updated_at = NOW()`);
        values.push(id);

        const updateQuery = `
            UPDATE service_requests 
            SET ${updates.join(', ')}
            WHERE id = $${paramIndex}
            RETURNING *
        `;

        const result = await client.query(updateQuery, values);

        await client.query("COMMIT");

        return res.status(200).json({
            status: "success",
            message: "Solicitud actualizada",
            request: result.rows[0]
        });
    } catch (error) {
        try { await client.query("ROLLBACK"); } catch (_) {}
        return res.status(400).json({
            status: "error",
            message: "No se pudo actualizar la solicitud",
            error: error.message
        });
    } finally {
        client.release();
    }
};

// Eliminar/Cancelar solicitud
export const deleteRequest = async (req, res) => {
    const userId = req.user?.id;
    if (!userId) {
        return res.status(401).json({ status: "error", message: "No autenticado" });
    }

    const { id } = req.params;
    const { role } = req.user;

    try {
        // Obtener la solicitud
        const requestCheck = await pool.query(
            "SELECT * FROM service_requests WHERE id = $1",
            [id]
        );

        if (requestCheck.rowCount === 0) {
            return res.status(404).json({
                status: "error",
                message: "Solicitud no encontrada"
            });
        }

        const request = requestCheck.rows[0];

        // Verificar permisos: solo cliente, trabajador asignado o admin pueden eliminar
        const canDelete = 
            role === 'admin' ||
            (role === 'usuario' && request.client_id === userId) ||
            (role === 'trabajador' && request.worker_id === userId);

        if (!canDelete) {
            return res.status(403).json({
                status: "error",
                message: "No tienes permisos para eliminar esta solicitud"
            });
        }

        // Solo se pueden eliminar solicitudes en estado 'pending' o 'cancelled'
        if (request.status !== 'pending' && request.status !== 'cancelled' && role !== 'admin') {
            return res.status(400).json({
                status: "error",
                message: "Solo se pueden eliminar solicitudes en estado 'pending' o 'cancelled'"
            });
        }

        const result = await pool.query(
            "DELETE FROM service_requests WHERE id = $1 RETURNING id",
            [id]
        );

        return res.status(200).json({
            status: "success",
            message: "Solicitud eliminada correctamente",
            deleted_id: result.rows[0].id
        });
    } catch (error) {
        return res.status(500).json({
            status: "error",
            message: "Error al eliminar la solicitud",
            error: error.message
        });
    }
};
