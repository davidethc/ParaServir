import jwt from "jwt-simple";
import moment from "moment";
import dotenv from "dotenv";

dotenv.config();

export const secret = process.env.JWT_SECRET;

export const createToken = (user) => {
    if (!user.email) {
        throw new Error("No se puede crear token sin email");
    }

    if (!user.id) {
        throw new Error("No se puede crear token sin ID de usuario");
    }

    const payload = {
        id: user.id,
        email: user.email.toLowerCase(),
        role: user.role,

        // Fecha de creación
        iat: moment().unix(),

        // Token válido por 48 horas
        exp: moment().add(48, "hours").unix(),
    };

    return jwt.encode(payload, secret);
};
