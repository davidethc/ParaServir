-- Migración: Agregar campos de geolocalización a la tabla profiles
-- Fecha: 2026-01-13
-- Descripción: Agrega campos latitude y longitude para habilitar búsqueda por proximidad

BEGIN;

-- Agregar columnas de geolocalización
ALTER TABLE profiles 
ADD COLUMN IF NOT EXISTS latitude DECIMAL(10, 8),
ADD COLUMN IF NOT EXISTS longitude DECIMAL(11, 8);

-- Crear índice para búsquedas rápidas por coordenadas
CREATE INDEX IF NOT EXISTS idx_profiles_coords ON profiles(latitude, longitude);

-- Crear índice compuesto para búsquedas por ubicación y coordenadas
CREATE INDEX IF NOT EXISTS idx_profiles_location_coords ON profiles(location, latitude, longitude) 
WHERE latitude IS NOT NULL AND longitude IS NOT NULL;

COMMENT ON COLUMN profiles.latitude IS 'Latitud geográfica del usuario (coordenada Y)';
COMMENT ON COLUMN profiles.longitude IS 'Longitud geográfica del usuario (coordenada X)';

COMMIT;
