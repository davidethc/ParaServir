import bcrypt from "bcrypt";
import {pool} from "../db.js";
import { createToken, secret } from "../helpers/jwt.js";
import jwt from "jwt-simple";
import moment from "moment";

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
            `SELECT id, email, password_hash, role
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
        const token = createToken({ id: user.id, email: user.email, role: user.role });

        return res.status(200).json({
            status: "success",
            message: "Bienvenido",
            user: {
                id: user.id,
                email: user.email,
                role: user.role
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


export const logout = async(req, res)=>{
    try{        
        // Borrar la Cookie del Token
        res.cookie('access_token', '', { 
            expires: new Date(0), 
            httpOnly: true,       // Mantener la bandera de seguridad
            secure: process.env.NODE_ENV === 'production', // Usar solo sobre HTTPS en producción
            sameSite: 'strict'    // Recomendado para seguridad CSRF
        });

        // Respuesta de confirmación
        return res.status(200).json({
            status: "success",
            message: "Sesión cerrada. Cookie de token eliminada."
        });
    }catch(error){
        return res.status(400).json({
            message:"Hubo un error al cerrar sesión",
            error: error.message
        })
    }
};

export const verifyEmail = async(req, res)=> {
    const { token } = req.query;

    if (!token) {
        return res.status(400).json({ message: "Token no proporcionado" });
    }

    try{
        const decoded = jwt.decode(token, secret);

        // Verificar expiración (exp está en segundos)
        if (decoded.exp && decoded.exp <= moment().unix()) {
            return res.status(400).json({ message: "Token expirado" });
        }

        const userId = decoded.id;
        if (!userId) {
            return res.status(400).json({ message: "Token inválido: no contiene id de usuario" });
        }

        const result = await pool.query(
            "UPDATE users SET is_verified = true WHERE id = $1 RETURNING *",
            [userId]
        );

        if (result.rowCount === 0) {
            return res.status(404).json({ message: "Usuario no encontrado" });
        }

        return res.json({ message: "Correo verificado exitosamente" });
        
    }catch(error){
        return res.status(400).json({
            message: "Token inválido o expirado",
            error: error.message,
        });
    }
};

export const changePassword = async (req, res) => {
    const userId = req.user.id;
    const oldPassword = req.body.oldPassword;
    const newPassword = req.body.newPassword;
    let client;
    try {
        client = await pool.connect();
        await client.query(`BEGIN`);

        if (!oldPassword || !newPassword) {
            await client.query(`ROLLBACK`)
            return res.status(400).json({
                message: "Debe proporcionar la contraseña antigua y la nueva"
            })
        }

        const pass = await client.query(
            `SELECT password_hash FROM users WHERE id = $1`,
            [userId]
        );

        const match = bcrypt.compareSync(
            oldPassword, pass.rows[0].password_hash
        );

        if (!match) {
            await client.query(`ROLLBACK`);
            return res.status(400).json({
                message: "Contraseña antigua incorrecta"
            })
        }

        const newHash = await bcrypt.hash(newPassword, 10);
        const { rows } = await client.query(`
           UPDATE users SET password_hash = $1 WHERE id = $2;
        `, [newHash, userId]
        );
        await client.query(`COMMIT`);
        return res.status(200).json({
            status: "succes",
            message: "Contraseña actualizada correctamente",
            rows
        })

    } catch (error) {
        return res.status(400).json({
            status: "error",
            errror: error.message
        })
    }finally{
        client.release();
    }
};