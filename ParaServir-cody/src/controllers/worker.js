import { pool } from "../db.js";
import {validateWorkerData} from "../helpers/validateWorker.js";
import { geocodeAddress, reverseGeocode, calculateDistance } from "../services/geocoding.service.js";

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
                p.latitude, p.longitude,
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
                p.latitude, p.longitude,
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

        // Verificar que el trabajador tenga ubicación configurada
        const profileCheck = await client.query(
            `SELECT latitude, longitude, location FROM profiles WHERE user_id = $1`,
            [userId]
        );

        if (profileCheck.rowCount === 0 || (!profileCheck.rows[0].latitude || !profileCheck.rows[0].longitude)) {
            // Intentar obtener ubicación del request o geocodificar
            const { address, latitude, longitude } = req.body;

            let lat = latitude ? parseFloat(latitude) : null;
            let lng = longitude ? parseFloat(longitude) : null;
            let finalAddress = address || profileCheck.rows[0]?.location || null;

            // Si no hay coordenadas pero hay dirección, geocodificar
            if ((!lat || !lng) && finalAddress) {
                try {
                    const geocodeResult = await geocodeAddress(finalAddress);
                    if (geocodeResult) {
                        lat = geocodeResult.latitude;
                        lng = geocodeResult.longitude;
                        finalAddress = geocodeResult.formatted_address;
                    }
                } catch (geoError) {
                    console.error('Error en geocodificación:', geoError);
                }
            }

            // Si aún no hay coordenadas, requerir ubicación
            if (!lat || !lng) {
                await client.query("ROLLBACK");
                return res.status(400).json({
                    status: "error",
                    message: "Debes configurar tu ubicación antes de crear servicios. Proporciona 'address' o 'latitude'/'longitude' en el request, o configura tu ubicación en Configuración."
                });
            }

            // Actualizar perfil con ubicación
            await client.query(
                `UPDATE profiles 
                 SET location = $1, latitude = $2, longitude = $3, updated_at = NOW()
                 WHERE user_id = $4`,
                [finalAddress, lat, lng, userId]
            );
        }

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

// ============================================================
// ENDPOINTS DE GEOLOCALIZACIÓN
// ============================================================

/**
 * Actualizar ubicación del trabajador
 * Permite actualizar la ubicación mediante dirección (geocodificación automática) 
 * o coordenadas directas
 * 
 * POST/PUT /api/workers/location
 * Body: { address?: string, latitude?: number, longitude?: number }
 */
export async function updateLocation(req, res) {
    const userId = req.user?.id;
    if (!userId) {
        return res.status(401).json({ status: "error", message: "No autenticado" });
    }

    const { address, latitude, longitude } = req.body;

    try {
        let lat = latitude ? parseFloat(latitude) : null;
        let lng = longitude ? parseFloat(longitude) : null;
        let finalAddress = address;

        // Si viene dirección, convertirla a coordenadas automáticamente (GRATIS)
        if (address && (!lat || !lng)) {
            const geocodeResult = await geocodeAddress(address);
            if (!geocodeResult) {
                return res.status(400).json({
                    status: "error",
                    message: "No se pudo encontrar la ubicación. Intenta con una dirección más específica (ej: 'Quito, Ecuador' o 'Loja, Ecuador')."
                });
            }
            lat = geocodeResult.latitude;
            lng = geocodeResult.longitude;
            finalAddress = geocodeResult.formatted_address;
        }
        // Si vienen coordenadas pero no dirección, obtener dirección automáticamente (GRATIS)
        else if (lat && lng && !address) {
            const reverseResult = await reverseGeocode(lat, lng);
            if (reverseResult) {
                finalAddress = reverseResult.formatted_address;
            }
        }

        if (!lat || !lng) {
            return res.status(400).json({
                status: "error",
                message: "Se requiere 'address' o 'latitude'/'longitude'"
            });
        }

        // Validar que las coordenadas sean válidas
        if (lat < -90 || lat > 90 || lng < -180 || lng > 180) {
            return res.status(400).json({
                status: "error",
                message: "Coordenadas inválidas. Latitud debe estar entre -90 y 90, Longitud entre -180 y 180"
            });
        }

        // Guardar en la base de datos
        const result = await pool.query(
            `UPDATE profiles 
             SET location = $1, latitude = $2, longitude = $3, updated_at = NOW()
             WHERE user_id = $4
             RETURNING latitude, longitude, location`,
            [finalAddress || null, lat, lng, userId]
        );

        if (result.rowCount === 0) {
            return res.status(404).json({
                status: "error",
                message: "Perfil no encontrado"
            });
        }

        return res.status(200).json({
            status: "success",
            message: "Ubicación actualizada correctamente",
            location: {
                address: result.rows[0].location,
                latitude: parseFloat(result.rows[0].latitude),
                longitude: parseFloat(result.rows[0].longitude)
            }
        });
    } catch (error) {
        return res.status(400).json({
            status: "error",
            message: "Error al actualizar ubicación",
            error: error.message
        });
    }
}

/**
 * Buscar trabajadores cercanos a una ubicación
 * Permite buscar trabajadores dentro de un radio específico (en km)
 * Opcionalmente puede filtrar por categoría
 * 
 * GET /api/workers/nearby?latitude=-0.1807&longitude=-78.4678&radius=10&category_id=xxx
 * Query params:
 *   - latitude (required): Latitud del punto de búsqueda
 *   - longitude (required): Longitud del punto de búsqueda
 *   - radius (optional): Radio de búsqueda en km (default: 10)
 *   - category_id (optional): Filtrar por categoría de servicio
 */
export async function findNearbyWorkers(req, res) {
    try {
        const { latitude, longitude, radius = 10, category_id } = req.query;

        if (!latitude || !longitude) {
            return res.status(400).json({
                status: "error",
                message: "Se requieren los parámetros 'latitude' y 'longitude'"
            });
        }

        const lat = parseFloat(latitude);
        const lng = parseFloat(longitude);
        const radiusKm = parseFloat(radius) || 10;

        // Validar coordenadas
        if (isNaN(lat) || isNaN(lng) || lat < -90 || lat > 90 || lng < -180 || lng > 180) {
            return res.status(400).json({
                status: "error",
                message: "Coordenadas inválidas"
            });
        }

        // Validar radio
        if (isNaN(radiusKm) || radiusKm <= 0 || radiusKm > 1000) {
            return res.status(400).json({
                status: "error",
                message: "El radio debe ser un número entre 0 y 1000 km"
            });
        }

        // Query para encontrar trabajadores cercanos usando fórmula de Haversine
        // La fórmula calcula la distancia en kilómetros entre dos puntos geográficos
        let query = `
            SELECT 
                u.id, u.email, u.role, u.is_verified,
                p.first_name, p.last_name, p.cedula, p.phone, 
                p.avatar_url, p.location, p.latitude, p.longitude,
                wp.years_experience, wp.certification_url, 
                wp.verification_status, wp.is_active,
                (
                    6371 * acos(
                        cos(radians($1)) * 
                        cos(radians(p.latitude)) * 
                        cos(radians(p.longitude) - radians($2)) + 
                        sin(radians($1)) * 
                        sin(radians(p.latitude))
                    )
                ) AS distance_km
            FROM users u
            INNER JOIN profiles p ON u.id = p.user_id
            INNER JOIN worker_profiles wp ON u.id = wp.user_id
            WHERE u.role = 'trabajador'
                AND wp.is_active = true
                AND p.latitude IS NOT NULL
                AND p.longitude IS NOT NULL
        `;

        const params = [lat, lng];
        let paramIndex = 3;

        // Filtrar por categoría si se proporciona
        if (category_id) {
            query += ` AND EXISTS (
                SELECT 1 FROM worker_services ws 
                WHERE ws.worker_id = u.id 
                AND ws.category_id = $${paramIndex}
                AND ws.is_available = true
            )`;
            params.push(category_id);
            paramIndex++;
        }

        // Filtrar por distancia usando HAVING
        query += `
            HAVING (
                6371 * acos(
                    cos(radians($1)) * 
                    cos(radians(p.latitude)) * 
                    cos(radians(p.longitude) - radians($2)) + 
                    sin(radians($1)) * 
                    sin(radians(p.latitude))
                )
            ) <= $${paramIndex}
            ORDER BY distance_km ASC
            LIMIT 50
        `;
        params.push(radiusKm);

        const { rows } = await pool.query(query, params);

        // Formatear respuesta
        const workers = rows.map(row => ({
            id: row.id,
            email: row.email,
            role: row.role,
            is_verified: row.is_verified,
            first_name: row.first_name,
            last_name: row.last_name,
            cedula: row.cedula,
            phone: row.phone,
            avatar_url: row.avatar_url,
            location: row.location,
            latitude: row.latitude ? parseFloat(row.latitude) : null,
            longitude: row.longitude ? parseFloat(row.longitude) : null,
            years_experience: row.years_experience,
            certification_url: row.certification_url,
            verification_status: row.verification_status,
            is_active: row.is_active,
            distance_km: parseFloat(row.distance_km).toFixed(2)
        }));

        return res.status(200).json({
            status: "success",
            search_location: {
                latitude: lat,
                longitude: lng,
                radius_km: radiusKm
            },
            workers: workers,
            count: workers.length
        });
    } catch (error) {
        console.error('Error al buscar trabajadores cercanos:', error);
        return res.status(500).json({
            status: "error",
            message: "Error al buscar trabajadores cercanos",
            error: error.message
        });
    }
}

/**
 * Buscar trabajadores por categoría y ubicación (texto)
 * Permite buscar trabajadores por categoría y ubicación textual
 * 
 * GET /api/workers/search?category_id=xxx&location=Quito&radius=10
 */
export async function searchWorkersByLocation(req, res) {
    try {
        const { category_id, location, radius = 10 } = req.query;

        if (!location) {
            return res.status(400).json({
                status: "error",
                message: "Se requiere el parámetro 'location'"
            });
        }

        // Geocodificar la ubicación proporcionada
        const geocodeResult = await geocodeAddress(location);
        if (!geocodeResult) {
            return res.status(400).json({
                status: "error",
                message: "No se pudo encontrar la ubicación especificada"
            });
        }

        // Usar el endpoint de búsqueda cercana con las coordenadas obtenidas
        req.query.latitude = geocodeResult.latitude.toString();
        req.query.longitude = geocodeResult.longitude.toString();
        req.query.radius = radius;
        if (category_id) {
            req.query.category_id = category_id;
        }

        return await findNearbyWorkers(req, res);
    } catch (error) {
        return res.status(500).json({
            status: "error",
            message: "Error al buscar trabajadores",
            error: error.message
        });
    }
}
