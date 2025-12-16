import jwt from "jwt-simple";
import { secret } from "../helpers/jwt.js";
import { pool } from "../db.js";

/**
 * Middleware que verifica que el usuario logueado solo pueda hacer cambios en sus propios datos
 * 
 * Uso en rutas:
 * router.put('/update/:id', auth, verifyOwnership('users', 'id'), updateUser);
 * router.delete('/delete/:id', auth, verifyOwnership('services', 'id', 'worker_id'), deleteService);
 * 
 * @param {string} tableName - Nombre de la tabla (ej: 'users', 'services', 'serviceRequest')
 * @param {string} paramName - Nombre del parámetro en la URL (ej: 'id')
 * @param {string} ownerField - Campo que contiene el ID del propietario en la tabla (por defecto es 'user_id' o 'worker_id')
 */ 

export const verifyOwnership = (tableName, paramName, ownerField = 'user_id') => {
    return async (req, res, next) => {
        try {
            // Obtener el token del header
            let token = req.cookies?.access_token;
            
            if (!token && req.headers.authorization) {
                token = req.headers.authorization
                    .replace(/['"]+/g, "")
                    .replace("Bearer ", "");
            }

            if (!token) {
                return res.status(403).json({
                    status: "error",
                    message: "No hay token de autenticación"
                });
            }

            // Decodificar el token
            const payload = jwt.decode(token, secret);
            const userId = payload.id;

            // Obtener el ID del recurso a modificar desde los parámetros
            const resourceId = req.params[paramName];

            if (!resourceId) {
                return res.status(400).json({
                    status: "error",
                    message: `Parámetro '${paramName}' no encontrado en la solicitud`
                });
            }

            // Consultar la base de datos para verificar el propietario
            const query = `SELECT ${ownerField} FROM ${tableName} WHERE id = $1 LIMIT 1`;
            const result = await pool.query(query, [resourceId]);

            if (result.rows.length === 0) {
                return res.status(404).json({
                    status: "error",
                    message: `Recurso no encontrado en ${tableName}`
                });
            }

            const owner = result.rows[0][ownerField];

            // Verificar que el usuario sea el propietario del recurso
            if (owner !== userId) {
                return res.status(403).json({
                    status: "error",
                    message: "No tienes permiso para modificar este recurso. Solo puedes cambiar tus propios datos."
                });
            }

            // Si todo es correcto, continuar
            req.resourceOwner = owner;
            next();

        } catch (error) {
            console.error("Error en verifyOwnership:", error);
            return res.status(500).json({
                status: "error",
                message: "Error al verificar permisos"
            });
        }
    };
};

