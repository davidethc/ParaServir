import moment from "moment";
import jwt from "jwt-simple";
import { secret } from "../helpers/jwt.js";
import { pool } from "../db.js"; // ← Asegúrate de importar tu pool

export const auth = async (req, res, next) => {
    let token = req.cookies?.access_token;

    if (!token) {
        // Buscar en la cabecera
        if (req.headers.authorization) {
            token = req.headers.authorization
                .replace(/['"]+/g, "")
                .replace("Bearer ", "");
        } else {
            return res.status(403).json({
                status: "error",
                message: "La petición no tiene token de autenticación."
            });
        }
    }

    try {
        const payload = jwt.decode(token, secret);

        // Validar que el ID exista en el payload
        if (!payload.id) {
            return res.status(401).json({
                status: "error",
                message: "Token inválido. No contiene ID de usuario.",
            });
        }

        // Validar expiración
        if (payload.exp <= moment().unix()) {
            return res.status(401).json({
                status: "error",
                message: "Token expirado",
            });
        }

        // Verificar si el usuario aún existe en la base de datos
        const result = await pool.query(
            "SELECT id FROM users WHERE id = $1 LIMIT 1",
            [payload.id]
        );

        if (result.rows.length === 0) {
            return res.status(401).json({
                status: "error",
                message: "Token inválido. Usuario eliminado.",
            });
        }

        // Guardar el usuario decodificado
        req.user = payload;

        next();
    } catch (error) {
        return res.status(401).json({
            status: "error",
            message: "Token inválido",
            error: error.message,
        });
    }
};
