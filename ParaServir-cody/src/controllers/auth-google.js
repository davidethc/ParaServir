import { pool } from "../db.js";
import { createToken } from "../helpers/jwt.js";
import { createNotification } from "./notification.js";

/**
 * Autenticación con Google OAuth
 * POST /auth/google
 */
export async function googleAuth(req, res) {
    try {
        const { email, name, google_id, picture } = req.body;

        if (!email || !google_id) {
            return res.status(400).json({
                status: "error",
                message: "Email y google_id son requeridos"
            });
        }

        const client = await pool.connect();
        try {
            await client.query('BEGIN');

            // Buscar usuario existente por email o google_id
            let user = await client.query(
                `SELECT u.*, p.first_name, p.last_name, p.avatar_url
                 FROM users u
                 LEFT JOIN profiles p ON u.id = p.user_id
                 WHERE u.email = $1`,
                [email]
            );

            if (user.rows.length === 0) {
                // Crear nuevo usuario
                // Generar password aleatorio (no se usará pero es requerido)
                const randomPassword = require('crypto').randomBytes(32).toString('hex');
                const bcrypt = require('bcrypt');
                const passwordHash = await bcrypt.hash(randomPassword, 10);

                const nameParts = (name || email.split('@')[0]).split(' ');
                const firstName = nameParts[0] || email.split('@')[0];
                const lastName = nameParts.slice(1).join(' ') || '';

                // Crear usuario
                const newUser = await client.query(
                    `INSERT INTO users (email, password_hash, role, is_verified)
                     VALUES ($1, $2, 'usuario', true)
                     RETURNING *`,
                    [email, passwordHash]
                );

                // Crear perfil
                await client.query(
                    `INSERT INTO profiles (user_id, first_name, last_name, cedula, avatar_url)
                     VALUES ($1, $2, $3, $4, $5)`,
                    [newUser.rows[0].id, firstName, lastName, '0000000000', picture || null]
                );

                user = { rows: [newUser.rows[0]] };
            } else {
                // Actualizar avatar si viene de Google
                if (picture && user.rows[0].avatar_url !== picture) {
                    await client.query(
                        `UPDATE profiles SET avatar_url = $1 WHERE user_id = $2`,
                        [picture, user.rows[0].id]
                    );
                }
            }

            await client.query('COMMIT');

            const userData = user.rows[0];
            const token = createToken({ 
                id: userData.id, 
                email: userData.email, 
                role: userData.role 
            });

            return res.status(200).json({
                status: "success",
                message: "Autenticación exitosa",
                user: {
                    id: userData.id,
                    email: userData.email,
                    role: userData.role,
                },
                token
            });
        } catch (error) {
            await client.query('ROLLBACK');
            throw error;
        } finally {
            client.release();
        }
    } catch (error) {
        return res.status(400).json({
            status: "error",
            message: "Error en autenticación con Google",
            error: error.message
        });
    }
}
