import { pool } from "../db.js";
import {validateWorkerData} from "../helpers/validateWorker.js";

export async function createWorker(client, userId, worker) {
    try {
        const result = await client.query(
            `INSERT INTO worker_profiles (user_id, years_experience, certification_url, verification_status, is_active)
             VALUES ($1, $2, $3, $4, $5)
             RETURNING *`,
            [
                userId,
                worker.years_experience,
                worker.certification_url,
                worker.verification_status || 'pending',
                worker.is_active == null ? true : worker.is_active
            ]
        );

        const workerProfile = result.rows[0];

        // Si se envían datos del servicio, crear también un servicio vinculado
        let createdService = null;
        const svc = worker.service;
        if (svc) {
            // Determinar category_id: usar category_id si viene, o buscar por nombre
            let categoryId = svc.category_id || null;
            if (!categoryId && svc.category_name) {
                const catRes = await client.query(
                    `SELECT id FROM service_categories WHERE LOWER(name) = LOWER($1) LIMIT 1`,
                    [svc.category_name]
                );
                if (catRes.rowCount === 0) {
                    throw new Error(`Categoría no encontrada: ${svc.category_name}`);
                }
                categoryId = catRes.rows[0].id;
            }

            if (!categoryId) {
                throw new Error('Se requiere category_id o category_name para crear el servicio');
            }

            // Título obligatorio para crear el servicio
            const title = svc.title || svc.service_title;
            if (!title) {
                throw new Error('Se requiere un título para el servicio del trabajador');
            }

            const description = svc.description || svc.service_description || null;
            const basePrice = svc.base_price != null ? svc.base_price : null;

            const svcRes = await client.query(
                `INSERT INTO worker_services (worker_id, category_id, title, description, base_price)
                 VALUES ($1, $2, $3, $4, $5)
                 RETURNING *`,
                [userId, categoryId, title, description, basePrice]
            );

            createdService = svcRes.rows[0];
        }

        return {
            profile: workerProfile,
            service: createdService,
        };

    } catch (error) {
        throw new Error("Error al crear el perfil de empleado: " + error.message);
    }
}

export async function list(req, res) {
    try {
        const { rows } = await pool.query(`            
            SELECT 
                u.id, u.email, u.role, u.is_verified,
                p.first_name, p.last_name, p.cedula, p.phone, p.avatar_url, p.location,
                wp.years_experience, wp.certification_url, wp.verification_status, wp.is_active
            FROM users u
            INNER JOIN profiles p ON u.id = p.user_id
            INNER JOIN worker_profiles wp ON u.id = wp.user_id
            WHERE u.role = 'trabajador';
        `);

        if (!rows || rows.length === 0) {
            return res.status(404).json({
                message: "No se han encontrado empleados",
                error: error.message
            })
        }
        return res.status(200).json({
            status: "success",
            rows
        })

    } catch (error) {
        return res.status(401).json({
            message: "No se pudo ver los usuarios",
            error: error.message
        })
    }
}

export async function watch(req, res) {
    try {
        const {id} = req.params;

        const { rows } = await pool.query(`            
            SELECT 
                u.id, u.email, u.role, u.is_verified,
                p.first_name, p.last_name, p.cedula, p.phone, p.avatar_url, p.location,
                wp.years_experience, wp.certification_url, wp.verification_status, wp.is_active
            FROM users u
            INNER JOIN profiles p ON u.id = p.user_id
            INNER JOIN worker_profiles wp ON u.id = wp.user_id
            WHERE u.id = $1 AND u.role = 'trabajador';
        `, [id]);

        if (!rows || rows.length === 0) {
            return res.status(404).json({
                message: "No se ha encontrado ningún empleado con esa identificación",
                error: error.message
            })
        }

        return res.status(200).json({
            status: "success",
            rows
        });
    } catch (error) {
        return res.status(401).json({
            message: "Hubo un error en la consulta",
            error: error.message
        })
    }

}

// Crear o actualizar el perfil del trabajador (años experiencia, certificación, estado)
export async function upsertProfile(req, res) {
    const userId = req.user?.id;
    if (!userId) {
        return res.status(401).json({ status: "error", message: "No autenticado" });
    }

    try {
        // Reutilizamos validaciones básicas (ignora servicio si no viene)
        const validated = validateWorkerData(req.body || {});
        const years_experience = validated.years_experience;
        const certification_url = validated.certification_url;
        const verification_status = validated.verification_status || "pending";
        const is_active = validated.is_active;

        const result = await pool.query(
            `INSERT INTO worker_profiles (user_id, years_experience, certification_url, verification_status, is_active)
             VALUES ($1, $2, $3, $4, $5)
             ON CONFLICT (user_id) DO UPDATE
             SET years_experience = EXCLUDED.years_experience,
                 certification_url = EXCLUDED.certification_url,
                 verification_status = EXCLUDED.verification_status,
                 is_active = EXCLUDED.is_active
             RETURNING *`,
            [userId, years_experience, certification_url, verification_status, is_active]
        );

        return res.status(200).json({
            status: "success",
            profile: result.rows[0]
        });
    } catch (error) {
        return res.status(400).json({
            status: "error",
            message: "No se pudo actualizar el perfil de trabajador",
            error: error.message
        });
    }
}

// Crear servicios para un trabajador (máx 3 en total)
export async function createServices(req, res) {
    const userId = req.user?.id;
    if (!userId) {
        return res.status(401).json({ status: "error", message: "No autenticado" });
    }

    const input = req.body?.services ?? req.body;
    const services = Array.isArray(input) ? input : (input ? [input] : []);

    if (services.length === 0) {
        return res.status(400).json({
            status: "error",
            message: "Debe enviar al menos un servicio en 'services'"
        });
    }

    const client = await pool.connect();
    try {
        await client.query("BEGIN");

        // Conteo actual
        const countRes = await client.query(
            "SELECT COUNT(*)::int AS count FROM worker_services WHERE worker_id = $1",
            [userId]
        );
        const currentCount = countRes.rows[0].count || 0;
        if (currentCount + services.length > 3) {
            await client.query("ROLLBACK");
            return res.status(400).json({
                status: "error",
                message: `Solo se permiten 3 servicios por trabajador. Ya tienes ${currentCount}, intentas agregar ${services.length}.`
            });
        }

        const created = [];

        for (const svc of services) {
            const validated = validateWorkerData(svc);
            const data = validated.service;

            if (!data) {
                throw new Error("Datos de servicio inválidos o incompletos");
            }

            // Resolver category_id (por id o por nombre)
            let categoryId = data.category_id || null;
            if (!categoryId && data.category_name) {
                const catRes = await client.query(
                    `SELECT id FROM service_categories WHERE LOWER(name) = LOWER($1) LIMIT 1`,
                    [data.category_name]
                );
                if (catRes.rowCount === 0) {
                    throw new Error(`Categoría no encontrada: ${data.category_name}`);
                }
                categoryId = catRes.rows[0].id;
            }
            if (!categoryId) {
                throw new Error("Se requiere category_id o category_name para el servicio");
            }

            const title = data.title || data.service_title;
            if (!title) {
                throw new Error("Se requiere título para el servicio");
            }

            const description = data.description || data.service_description || null;
            const basePrice = data.base_price != null ? data.base_price : null;

            const inserted = await client.query(
                `INSERT INTO worker_services (worker_id, category_id, title, description, base_price)
                 VALUES ($1, $2, $3, $4, $5)
                 RETURNING *`,
                [userId, categoryId, title, description, basePrice]
            );

            created.push(inserted.rows[0]);
        }

        await client.query("COMMIT");

        return res.status(201).json({
            status: "success",
            message: "Servicios creados",
            services: created
        });
    } catch (error) {
        try { await client.query("ROLLBACK"); } catch (_) {}
        return res.status(400).json({
            status: "error",
            message: "No se pudieron crear los servicios",
            error: error.message
        });
    } finally {
        client.release();
    }
}
export async function updateWorker(client, userId, worker) {
    try {
        // Validar datos del worker
        const { years_experience, certification_url, verification_status, is_active } =
            validateWorkerData(worker);

        const result = await client.query(
            `UPDATE worker_profiles
             SET years_experience = $1,
                 certification_url = $2,
                 verification_status = $3,
                 is_active = $4
             WHERE user_id = $5
             RETURNING *`,
            [
                years_experience,
                certification_url,
                verification_status,
                is_active,
                userId
            ]
        );

        if (result.rowCount === 0) {
            const newWorkerProfile = await client.query(
                `INSERT INTO worker_profiles (user_id, years_experience, certification_url, verification_status, is_active)
                 VALUES ($1, $2, $3, $4, $5)
                 ON CONFLICT (user_id) DO NOTHING
                 RETURNING *`,
                [userId, years_experience, certification_url, verification_status, is_active]
            );
            return newWorkerProfile.rows[0];
        }

        return result.rows[0];

    } catch (error) {
        throw new Error("Error al actualizar el perfil de empleado: " + error.message);
    }
}

// Obtener servicios de un trabajador
export async function getWorkerServices(req, res) {
    try {
        const { id } = req.params;

        const { rows } = await pool.query(
            `SELECT ws.id, ws.title, ws.description, ws.base_price, 
                    ws.is_available, ws.created_at, ws.updated_at,
                    sc.id as category_id, sc.name as category_name, sc.icon as category_icon
             FROM worker_services ws
             INNER JOIN service_categories sc ON ws.category_id = sc.id
             WHERE ws.worker_id = $1
             ORDER BY ws.created_at DESC`,
            [id]
        );

        return res.status(200).json({
            status: 'success',
            services: rows
        });
    } catch (error) {
        return res.status(500).json({
            status: 'error',
            message: 'Error al obtener los servicios',
            error: error.message
        });
    }
}

// Actualizar un servicio
export async function updateService(req, res) {
    const userId = req.user?.id;
    if (!userId) {
        return res.status(401).json({ status: "error", message: "No autenticado" });
    }

    const { id } = req.params;
    const { title, description, base_price, is_available, category_id, category_name } = req.body;

    const client = await pool.connect();
    try {
        await client.query("BEGIN");

        // Verificar que el servicio pertenece al trabajador autenticado
        const serviceCheck = await client.query(
            "SELECT worker_id FROM worker_services WHERE id = $1",
            [id]
        );

        if (serviceCheck.rowCount === 0) {
            await client.query("ROLLBACK");
            return res.status(404).json({
                status: "error",
                message: "Servicio no encontrado"
            });
        }

        if (serviceCheck.rows[0].worker_id !== userId) {
            await client.query("ROLLBACK");
            return res.status(403).json({
                status: "error",
                message: "No tienes permisos para actualizar este servicio"
            });
        }

        // Resolver category_id si viene category_name
        let finalCategoryId = category_id;
        if (!finalCategoryId && category_name) {
            const catRes = await client.query(
                `SELECT id FROM service_categories WHERE LOWER(name) = LOWER($1) LIMIT 1`,
                [category_name]
            );
            if (catRes.rowCount === 0) {
                await client.query("ROLLBACK");
                return res.status(400).json({
                    status: "error",
                    message: `Categoría no encontrada: ${category_name}`
                });
            }
            finalCategoryId = catRes.rows[0].id;
        }

        // Construir query de actualización dinámicamente
        const updates = [];
        const values = [];
        let paramIndex = 1;

        if (title !== undefined) {
            updates.push(`title = $${paramIndex++}`);
            values.push(title);
        }
        if (description !== undefined) {
            updates.push(`description = $${paramIndex++}`);
            values.push(description);
        }
        if (base_price !== undefined) {
            updates.push(`base_price = $${paramIndex++}`);
            values.push(base_price);
        }
        if (is_available !== undefined) {
            updates.push(`is_available = $${paramIndex++}`);
            values.push(is_available);
        }
        if (finalCategoryId !== undefined) {
            updates.push(`category_id = $${paramIndex++}`);
            values.push(finalCategoryId);
        }

        if (updates.length === 0) {
            await client.query("ROLLBACK");
            return res.status(400).json({
                status: "error",
                message: "No se proporcionaron campos para actualizar"
            });
        }

        updates.push(`updated_at = NOW()`);
        values.push(id);

        const updateQuery = `
            UPDATE worker_services 
            SET ${updates.join(', ')}
            WHERE id = $${paramIndex}
            RETURNING *
        `;

        const result = await client.query(updateQuery, values);

        await client.query("COMMIT");

        return res.status(200).json({
            status: "success",
            message: "Servicio actualizado",
            service: result.rows[0]
        });
    } catch (error) {
        try { await client.query("ROLLBACK"); } catch (_) {}
        return res.status(400).json({
            status: "error",
            message: "No se pudo actualizar el servicio",
            error: error.message
        });
    } finally {
        client.release();
    }
}

// Eliminar un servicio
export async function deleteService(req, res) {
    const userId = req.user?.id;
    if (!userId) {
        return res.status(401).json({ status: "error", message: "No autenticado" });
    }

    const { id } = req.params;

    try {
        // Verificar que el servicio pertenece al trabajador autenticado
        const serviceCheck = await pool.query(
            "SELECT worker_id FROM worker_services WHERE id = $1",
            [id]
        );

        if (serviceCheck.rowCount === 0) {
            return res.status(404).json({
                status: "error",
                message: "Servicio no encontrado"
            });
        }

        if (serviceCheck.rows[0].worker_id !== userId) {
            return res.status(403).json({
                status: "error",
                message: "No tienes permisos para eliminar este servicio"
            });
        }

        const result = await pool.query(
            "DELETE FROM worker_services WHERE id = $1 RETURNING id",
            [id]
        );

        return res.status(200).json({
            status: "success",
            message: "Servicio eliminado correctamente",
            deleted_id: result.rows[0].id
        });
    } catch (error) {
        return res.status(500).json({
            status: "error",
            message: "Error al eliminar el servicio",
            error: error.message
        });
    }
}
