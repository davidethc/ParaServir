import { pool } from "../db.js";
import { createNotification } from "./notification.js";

/**
 * Obtener todas las conversaciones del usuario autenticado
 * Una conversación es una solicitud de servicio donde el usuario participa
 */
export const getConversations = async (req, res) => {
    const userId = req.user?.id;
    if (!userId) {
        return res.status(401).json({ status: "error", message: "No autenticado" });
    }

    try {
        // Obtener todas las solicitudes donde el usuario es cliente o trabajador
        const result = await pool.query(
            `SELECT 
                sr.id as request_id,
                sr.status,
                sr.description,
                sr.created_at,
                sr.updated_at,
                -- Información del cliente
                client.id as client_id,
                client_profile.first_name as client_first_name,
                client_profile.last_name as client_last_name,
                client_profile.avatar_url as client_avatar,
                -- Información del trabajador
                worker.id as worker_id,
                worker_profile.first_name as worker_first_name,
                worker_profile.last_name as worker_last_name,
                worker_profile.avatar_url as worker_avatar,
                -- Último mensaje
                (SELECT content FROM messages 
                 WHERE request_id = sr.id 
                 ORDER BY created_at DESC 
                 LIMIT 1) as last_message,
                (SELECT created_at FROM messages 
                 WHERE request_id = sr.id 
                 ORDER BY created_at DESC 
                 LIMIT 1) as last_message_at,
                -- Contador de mensajes no leídos (simplificado: todos los mensajes del otro usuario)
                (SELECT COUNT(*) FROM messages 
                 WHERE request_id = sr.id 
                 AND sender_id != $1) as unread_count
            FROM service_requests sr
            LEFT JOIN users client ON sr.client_id = client.id
            LEFT JOIN profiles client_profile ON client.id = client_profile.user_id
            LEFT JOIN users worker ON sr.worker_id = worker.id
            LEFT JOIN profiles worker_profile ON worker.id = worker_profile.user_id
            WHERE (sr.client_id = $1 OR sr.worker_id = $1)
            AND sr.worker_id IS NOT NULL
            ORDER BY 
                COALESCE(
                    (SELECT created_at FROM messages 
                     WHERE request_id = sr.id 
                     ORDER BY created_at DESC 
                     LIMIT 1),
                    sr.updated_at
                ) DESC`,
            [userId]
        );

        const conversations = result.rows.map(row => {
            const isClient = row.client_id === userId;
            const otherUser = isClient 
                ? {
                    id: row.worker_id,
                    first_name: row.worker_first_name,
                    last_name: row.worker_last_name,
                    avatar: row.worker_avatar
                }
                : {
                    id: row.client_id,
                    first_name: row.client_first_name,
                    last_name: row.client_last_name,
                    avatar: row.client_avatar
                };

            return {
                id: row.request_id,
                request_id: row.request_id,
                status: row.status,
                description: row.description,
                other_user: otherUser,
                last_message: row.last_message,
                last_message_at: row.last_message_at,
                unread_count: parseInt(row.unread_count) || 0,
                created_at: row.created_at,
                updated_at: row.updated_at
            };
        });

        return res.json({
            status: "success",
            conversations
        });
    } catch (error) {
        console.error("Error al obtener conversaciones:", error);
        return res.status(500).json({
            status: "error",
            message: "Error al obtener conversaciones"
        });
    }
};

/**
 * Obtener mensajes de una conversación específica (solicitud de servicio)
 */
export const getMessages = async (req, res) => {
    const userId = req.user?.id;
    const { requestId } = req.params;

    if (!userId) {
        return res.status(401).json({ status: "error", message: "No autenticado" });
    }

    if (!requestId) {
        return res.status(400).json({ status: "error", message: "requestId es requerido" });
    }

    try {
        // Verificar que el usuario tiene acceso a esta solicitud
        const requestCheck = await pool.query(
            `SELECT id, client_id, worker_id 
             FROM service_requests 
             WHERE id = $1 AND (client_id = $2 OR worker_id = $2)`,
            [requestId, userId]
        );

        if (requestCheck.rowCount === 0) {
            return res.status(403).json({
                status: "error",
                message: "No tienes acceso a esta conversación"
            });
        }

        // Obtener todos los mensajes de esta solicitud
        const result = await pool.query(
            `SELECT 
                m.id,
                m.content,
                m.created_at,
                m.sender_id,
                p.first_name,
                p.last_name,
                p.avatar_url
            FROM messages m
            LEFT JOIN profiles p ON m.sender_id = p.user_id
            WHERE m.request_id = $1
            ORDER BY m.created_at ASC`,
            [requestId]
        );

        const messages = result.rows.map(row => ({
            id: row.id,
            content: row.content,
            created_at: row.created_at,
            sender_id: row.sender_id,
            sender_name: `${row.first_name} ${row.last_name}`,
            sender_avatar: row.avatar_url,
            is_own: row.sender_id === userId
        }));

        return res.json({
            status: "success",
            messages
        });
    } catch (error) {
        console.error("Error al obtener mensajes:", error);
        return res.status(500).json({
            status: "error",
            message: "Error al obtener mensajes"
        });
    }
};

/**
 * Enviar un mensaje en una conversación
 */
export const sendMessage = async (req, res) => {
    const userId = req.user?.id;
    const { requestId } = req.params;
    const { content } = req.body;

    if (!userId) {
        return res.status(401).json({ status: "error", message: "No autenticado" });
    }

    if (!requestId) {
        return res.status(400).json({ status: "error", message: "requestId es requerido" });
    }

    if (!content || !content.trim()) {
        return res.status(400).json({
            status: "error",
            message: "El contenido del mensaje es requerido"
        });
    }

    const client = await pool.connect();
    try {
        await client.query("BEGIN");

        // Verificar que el usuario tiene acceso a esta solicitud
        const requestCheck = await client.query(
            `SELECT id, client_id, worker_id, status
             FROM service_requests 
             WHERE id = $1 AND (client_id = $2 OR worker_id = $2)`,
            [requestId, userId]
        );

        if (requestCheck.rowCount === 0) {
            await client.query("ROLLBACK");
            return res.status(403).json({
                status: "error",
                message: "No tienes acceso a esta conversación"
            });
        }

        const request = requestCheck.rows[0];

        // Verificar que la solicitud tiene un trabajador asignado
        if (!request.worker_id) {
            await client.query("ROLLBACK");
            return res.status(400).json({
                status: "error",
                message: "La solicitud aún no tiene un trabajador asignado"
            });
        }

        // Insertar el mensaje
        const messageResult = await client.query(
            `INSERT INTO messages (request_id, sender_id, content)
             VALUES ($1, $2, $3)
             RETURNING id, content, created_at`,
            [requestId, userId, content.trim()]
        );

        // Actualizar updated_at de la solicitud
        await client.query(
            `UPDATE service_requests 
             SET updated_at = NOW()
             WHERE id = $1`,
            [requestId]
        );

        // Determinar el receptor del mensaje
        const receiverId = userId === request.client_id ? request.worker_id : request.client_id;
        
        // Obtener nombre del remitente para la notificación
        const senderProfile = await client.query(
            `SELECT first_name, last_name FROM profiles WHERE user_id = $1`,
            [userId]
        );
        const senderName = senderProfile.rows[0] 
            ? `${senderProfile.rows[0].first_name} ${senderProfile.rows[0].last_name}`
            : 'Alguien';

        // Crear notificación para el receptor
        if (receiverId) {
            try {
                await createNotification(
                    receiverId,
                    'message',
                    'Nuevo Mensaje',
                    `${senderName} te envió un mensaje: ${content.substring(0, 50)}${content.length > 50 ? '...' : ''}`,
                    messageResult.rows[0].id
                );
            } catch (notifError) {
                console.error('Error al crear notificación de mensaje:', notifError);
            }
        }

        await client.query("COMMIT");

        // Obtener información del remitente
        const senderInfo = await pool.query(
            `SELECT first_name, last_name, avatar_url
             FROM profiles
             WHERE user_id = $1`,
            [userId]
        );

        const message = messageResult.rows[0];
        const sender = senderInfo.rows[0];

        return res.json({
            status: "success",
            message: {
                id: message.id,
                content: message.content,
                created_at: message.created_at,
                sender_id: userId,
                sender_name: sender ? `${sender.first_name} ${sender.last_name}` : "Usuario",
                sender_avatar: sender?.avatar_url,
                is_own: true
            }
        });
    } catch (error) {
        await client.query("ROLLBACK");
        console.error("Error al enviar mensaje:", error);
        return res.status(500).json({
            status: "error",
            message: "Error al enviar mensaje"
        });
    } finally {
        client.release();
    }
};

/**
 * Iniciar una conversación (crear primer mensaje en una solicitud)
 * Esto es útil cuando un cliente quiere iniciar chat con un trabajador
 */
export const startConversation = async (req, res) => {
    const userId = req.user?.id;
    const { request_id, content } = req.body;

    if (!userId) {
        return res.status(401).json({ status: "error", message: "No autenticado" });
    }

    if (!request_id || !content || !content.trim()) {
        return res.status(400).json({
            status: "error",
            message: "request_id y content son requeridos"
        });
    }

    const client = await pool.connect();
    try {
        await client.query("BEGIN");

        // Verificar que la solicitud existe y el usuario tiene acceso
        const requestCheck = await client.query(
            `SELECT id, client_id, worker_id, status
             FROM service_requests 
             WHERE id = $1 AND (client_id = $2 OR worker_id = $2)`,
            [request_id, userId]
        );

        if (requestCheck.rowCount === 0) {
            await client.query("ROLLBACK");
            return res.status(404).json({
                status: "error",
                message: "Solicitud no encontrada o no tienes acceso"
            });
        }

        const request = requestCheck.rows[0];

        // Verificar que la solicitud tiene un trabajador asignado
        if (!request.worker_id) {
            await client.query("ROLLBACK");
            return res.status(400).json({
                status: "error",
                message: "La solicitud aún no tiene un trabajador asignado"
            });
        }

        // Verificar si ya existe un mensaje en esta solicitud
        const existingMessage = await client.query(
            `SELECT id FROM messages WHERE request_id = $1 LIMIT 1`,
            [request_id]
        );

        if (existingMessage.rowCount > 0) {
            await client.query("ROLLBACK");
            return res.status(400).json({
                status: "error",
                message: "Esta conversación ya ha sido iniciada. Usa el endpoint de enviar mensaje."
            });
        }

        // Insertar el primer mensaje
        const messageResult = await client.query(
            `INSERT INTO messages (request_id, sender_id, content)
             VALUES ($1, $2, $3)
             RETURNING id, content, created_at`,
            [request_id, userId, content.trim()]
        );

        // Actualizar updated_at de la solicitud
        await client.query(
            `UPDATE service_requests 
             SET updated_at = NOW()
             WHERE id = $1`,
            [request_id]
        );

        await client.query("COMMIT");

        // Obtener información del remitente
        const senderInfo = await pool.query(
            `SELECT first_name, last_name, avatar_url
             FROM profiles
             WHERE user_id = $1`,
            [userId]
        );

        const message = messageResult.rows[0];
        const sender = senderInfo.rows[0];

        return res.json({
            status: "success",
            message: {
                id: message.id,
                content: message.content,
                created_at: message.created_at,
                sender_id: userId,
                sender_name: sender ? `${sender.first_name} ${sender.last_name}` : "Usuario",
                sender_avatar: sender?.avatar_url,
                is_own: true
            }
        });
    } catch (error) {
        await client.query("ROLLBACK");
        console.error("Error al iniciar conversación:", error);
        return res.status(500).json({
            status: "error",
            message: "Error al iniciar conversación"
        });
    } finally {
        client.release();
    }
};

