import moment from "moment";
import jwt from "jwt-simple";
import { secret } from "../helpers/jwt.js";

export const auth = (req, res, next) => {
    // Verificar cabecera
    if (!req.headers.authorization) {
        return res.status(403).json({
            status: "error",
            message: "La petición no tiene cabecera de autorización",
        });
    }

    // Limpiar token
    let token = req.headers.authorization
        .replace(/['"]+/g, "")
        .replace("Bearer ", "");

    try {
        const payload = jwt.decode(token, secret);

        // Validar expiración
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
