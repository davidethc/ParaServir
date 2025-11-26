import jwt from "jwt-simple";
import moment from "moment";

export const secret = "Barderos2005.";

export const createToken = (user) => {
    const payload = {
        id: user.id,
        email: user.email,

        // fechas
        iat: moment().unix(),
        exp: moment().add(2, "days").unix(),
    };

    return jwt.encode(payload, secret);
};
