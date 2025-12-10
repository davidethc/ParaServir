-- ===========================================================
-- CONSULTAS DE EJEMPLO PARA CATEGORÍAS, TRABAJADORES Y SERVICIOS
-- ===========================================================

-- 1. Obtener todas las categorías con conteo de trabajadores y servicios
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
ORDER BY sc.name ASC;

-- 2. Obtener detalle de una categoría específica (ej: Carpintería)
-- Reemplaza 'CATEGORY_ID_AQUI' con el ID real de la categoría
SELECT 
    sc.id, 
    sc.name, 
    sc.description, 
    sc.icon
FROM service_categories sc
WHERE sc.name ILIKE '%Carpintería%' OR sc.id = 'CATEGORY_ID_AQUI';

-- 3. Obtener trabajadores que ofrecen servicios en una categoría específica
-- Reemplaza 'CATEGORY_ID_AQUI' con el ID real de la categoría
SELECT DISTINCT
    u.id AS worker_id,
    p.first_name,
    p.last_name,
    p.phone,
    p.location,
    p.avatar_url,
    wp.years_experience,
    wp.verification_status,
    wp.is_active,
    COUNT(DISTINCT ws.id)::int AS services_count,
    MIN(ws.base_price) AS min_price,
    MAX(ws.base_price) AS max_price
FROM users u
INNER JOIN worker_services ws ON u.id = ws.worker_id
INNER JOIN profiles p ON u.id = p.user_id
LEFT JOIN worker_profiles wp ON u.id = wp.user_id
WHERE ws.category_id = 'CATEGORY_ID_AQUI'  -- Reemplazar con ID real
  AND ws.is_available = true
  AND u.role = 'trabajador'
  AND (wp.is_active = true OR wp.is_active IS NULL)
GROUP BY u.id, p.first_name, p.last_name, p.phone, p.location, 
         p.avatar_url, wp.years_experience, wp.verification_status, wp.is_active
ORDER BY p.first_name, p.last_name;

-- 4. Obtener servicios disponibles en una categoría específica
-- Reemplaza 'CATEGORY_ID_AQUI' con el ID real de la categoría
SELECT 
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
WHERE ws.category_id = 'CATEGORY_ID_AQUI'  -- Reemplazar con ID real
  AND ws.is_available = true
  AND u.role = 'trabajador'
  AND (wp.is_active = true OR wp.is_active IS NULL)
ORDER BY ws.base_price ASC, ws.title ASC;

-- 5. Consulta completa: Categoría con trabajadores y servicios (lo que usa el endpoint)
-- Esta es la consulta que usa el endpoint GET /categories/:id
WITH category_info AS (
    SELECT id, name, description, icon
    FROM service_categories
    WHERE id = 'CATEGORY_ID_AQUI'  -- Reemplazar con ID real
),
workers_info AS (
    SELECT DISTINCT
        u.id AS worker_id,
        p.first_name,
        p.last_name,
        p.phone,
        p.location,
        p.avatar_url,
        wp.years_experience,
        wp.verification_status,
        wp.is_active,
        COUNT(DISTINCT ws.id)::int AS services_count,
        MIN(ws.base_price) AS min_price,
        MAX(ws.base_price) AS max_price
    FROM users u
    INNER JOIN worker_services ws ON u.id = ws.worker_id
    INNER JOIN profiles p ON u.id = p.user_id
    LEFT JOIN worker_profiles wp ON u.id = wp.user_id
    WHERE ws.category_id = (SELECT id FROM category_info)
      AND ws.is_available = true
      AND u.role = 'trabajador'
      AND (wp.is_active = true OR wp.is_active IS NULL)
    GROUP BY u.id, p.first_name, p.last_name, p.phone, p.location, 
             p.avatar_url, wp.years_experience, wp.verification_status, wp.is_active
),
services_info AS (
    SELECT 
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
    WHERE ws.category_id = (SELECT id FROM category_info)
      AND ws.is_available = true
      AND u.role = 'trabajador'
      AND (wp.is_active = true OR wp.is_active IS NULL)
    ORDER BY ws.base_price ASC, ws.title ASC
)
SELECT 
    (SELECT * FROM category_info) AS category,
    (SELECT json_agg(row_to_json(w)) FROM workers_info w) AS workers,
    (SELECT json_agg(row_to_json(s)) FROM services_info s) AS services;

-- 6. Buscar categoría por nombre (útil para encontrar el ID)
SELECT id, name, description, icon
FROM service_categories
WHERE name ILIKE '%Carpintería%'
   OR name ILIKE '%carpinteria%'
ORDER BY name;

-- 7. Verificar si hay datos en las tablas
SELECT 
    (SELECT COUNT(*) FROM service_categories) AS total_categories,
    (SELECT COUNT(*) FROM users WHERE role = 'trabajador') AS total_workers,
    (SELECT COUNT(*) FROM worker_services WHERE is_available = true) AS total_services,
    (SELECT COUNT(*) FROM worker_services ws 
     INNER JOIN service_categories sc ON ws.category_id = sc.id 
     WHERE sc.name ILIKE '%Carpintería%' AND ws.is_available = true) AS carpinteria_services;
