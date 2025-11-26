import bcrypt from "bcrypt";
import {pool} from "../db.js";
import { createToken } from "../helpers/jwt.js";

export const login = async (req, res) => {
    try {
        const { email, password } = req.body;

        if (!email || !password) {
            return res.status(400).json({
                status: "error",
                message: "Ingrese email y contraseña"
            });
        }

        // Buscar usuario en PostgreSQL
        const result = await pool.query(
            `SELECT id, email, password_hash
             FROM users
             WHERE email = $1`,
            [email.toLowerCase()]
        );

        if (result.rows.length === 0) {
            return res.status(400).json({
                status: "error",
                message: "Credenciales incorrectas"
            });
        }

        const user = result.rows[0];

        // Comparar contraseñas
        const isValid = await bcrypt.compare(password, user.password_hash);
        if (!isValid) {
            return res.status(400).json({
                status: "error",
                message: "Credenciales incorrectas"
            });
        }

        // Generar token
        const token = createToken(user);

        return res.status(200).json({
            status: "success",
            message: "Bienvenido",
            user: {
                id: user.id,
                email: user.email
            },
            token
        });

    } catch (error) {
        return res.status(500).json({
            status: "error",
            message: "Error al iniciar sesión",
            error: error.message
        });
    }
};
