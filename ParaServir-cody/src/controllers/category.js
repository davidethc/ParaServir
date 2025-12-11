import { pool } from "../db.js";

// Listar todas las categorías (opcionalmente con conteo de trabajadores)
export async function list(req, res) {
  try {
    const { include_workers } = req.query;

    let query;
    if (include_workers === 'true') {
      // Incluir conteo de trabajadores únicos por categoría
      query = `
        SELECT 
          sc.id, 
          sc.name, 
          sc.description, 
          sc.icon,
          COUNT(DISTINCT ws.worker_id)::int AS workers_count,
          COUNT(ws.id)::int AS services_count
        FROM service_categories sc
        LEFT JOIN worker_services ws ON sc.id = ws.category_id AND ws.is_available = true
        GROUP BY sc.id, sc.name, sc.description, sc.icon
        ORDER BY sc.name ASC
      `;
    } else {
      // Solo categorías sin conteo
      query = `
        SELECT id, name, description, icon
        FROM service_categories
        ORDER BY name ASC
      `;
    }

    const { rows } = await pool.query(query);

    return res.status(200).json({
      status: "success",
      rows,
    });
  } catch (error) {
    return res.status(500).json({
      status: "error",
      message: "No se pudieron obtener las categorías",
      error: error.message,
    });
  }
}

// Obtener detalle de una categoría con trabajadores asociados
export async function getById(req, res) {
  try {
    const { id } = req.params;

    // Verificar que la categoría existe
    const categoryResult = await pool.query(
      `SELECT id, name, description, icon
       FROM service_categories
       WHERE id = $1`,
      [id]
    );

    if (categoryResult.rows.length === 0) {
      return res.status(404).json({
        status: "error",
        message: "Categoría no encontrada",
      });
    }

    const category = categoryResult.rows[0];

    // Obtener trabajadores asociados a esta categoría (a través de sus servicios)
    const workersResult = await pool.query(
      `SELECT DISTINCT
          u.id AS worker_id,
          p.first_name,
          p.last_name,
          p.phone,
          p.location,
          p.avatar_url,
          COALESCE(wp.years_experience, 0) AS years_experience,
          COALESCE(wp.verification_status, 'pending') AS verification_status,
          COALESCE(wp.is_active, true) AS is_active,
          COUNT(DISTINCT ws.id)::int AS services_count,
          MIN(ws.base_price) AS min_price,
          MAX(ws.base_price) AS max_price
       FROM users u
       INNER JOIN worker_services ws ON u.id = ws.worker_id
       INNER JOIN profiles p ON u.id = p.user_id
       LEFT JOIN worker_profiles wp ON u.id = wp.user_id
       WHERE ws.category_id = $1 
         AND ws.is_available = true
         AND u.role = 'trabajador'
         AND (wp.is_active = true OR wp.is_active IS NULL)
       GROUP BY u.id, p.first_name, p.last_name, p.phone, p.location, 
                p.avatar_url, wp.years_experience, wp.verification_status, wp.is_active
       ORDER BY p.first_name, p.last_name`,
      [id]
    );

    // Obtener servicios disponibles en esta categoría
    const servicesResult = await pool.query(
      `SELECT 
          ws.id,
          ws.title,
          ws.description,
          ws.base_price,
          ws.is_available,
          u.id AS worker_id,
          p.first_name || ' ' || p.last_name AS worker_name
       FROM worker_services ws
       INNER JOIN users u ON ws.worker_id = u.id
       INNER JOIN profiles p ON u.id = p.user_id
       LEFT JOIN worker_profiles wp ON u.id = wp.user_id
       WHERE ws.category_id = $1 
         AND ws.is_available = true
         AND u.role = 'trabajador'
         AND (wp.is_active = true OR wp.is_active IS NULL)
       ORDER BY ws.base_price ASC NULLS LAST, ws.title ASC`,
      [id]
    );

    return res.status(200).json({
      status: "success",
      category: {
        ...category,
        workers_count: workersResult.rows.length,
        services_count: servicesResult.rows.length,
      },
      workers: workersResult.rows,
      services: servicesResult.rows,
    });
  } catch (error) {
    return res.status(500).json({
      status: "error",
      message: "Error al obtener la categoría",
      error: error.message,
    });
  }
}

