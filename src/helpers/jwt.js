import jwt from "jwt-simple";
import moment from "moment";
import dotenv from "dotenv";

dotenv.config();

export const secret = process.env.JWT_SECRET;

export const createToken = (user) => {
    if (!user.email) {
        throw new Error("No se puede crear token sin email");
    }

    // Si no existe user.id, se asigna null (para evitar undefined)
    const payload = {
        id: user.id || null,
        email: user.email.toLowerCase(),
        role: user.role,

        // Fecha de creación
        iat: moment().unix(),

        // Token válido por 48 horas
        exp: moment().add(48, "hours").unix(),
    };

    return jwt.encode(payload, secret);
};
