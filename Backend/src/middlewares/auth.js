// middlewares/auth.js

import moment from "moment";
import jwt from "jwt-simple";
import { secret } from "../helpers/jwt.js";

export const auth = (req, res, next) => {
    let token = req.cookies?.access_token; // Usar req.cookies (requiere el middleware cookie-parser)

    if (!token) {
        // Buscar en la cabecera (por compatibilidad o pruebas)
        if (req.headers.authorization) {
            token = req.headers.authorization
                .replace(/['"]+/g, "")
                .replace("Bearer ", "");
        } else {
            return res.status(403).json({
                status: "error",
                message: "La petición no tiene token de autenticación (cookie o cabecera)."
            });
        }
    }
    
    try {
        const payload = jwt.decode(token, secret);

        // Validar expiración (Tu código actual)
        if (payload.exp <= moment().unix()) {
            return res.status(401).json({
                status: "error",
                message: "Token expirado",
            });
        }

        req.user = payload;
    } catch (error) {
        return res.status(401).json({
            status: "error",
            message: "Token inválido",
            error: error.message,
        });
    }

    next();
};