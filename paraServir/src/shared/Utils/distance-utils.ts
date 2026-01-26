/**
 * Utilidades para formatear distancias
 */

/**
 * Convierte una distancia en kilómetros a un texto legible
 * 
 * @param distanceKm - Distancia en kilómetros (puede ser number o string)
 * @returns Texto formateado (ej: "2.5 km", "850 m", "Menos de 1 km")
 * 
 * @example
 * formatDistance(2.5) // "2.5 km"
 * formatDistance(0.85) // "850 m"
 * formatDistance(0.5) // "500 m"
 * formatDistance(0) // "Menos de 100 m"
 * formatDistance("2.50") // "2.5 km"
 */
export function formatDistance(distanceKm: number | string | null | undefined): string | null {
  // Si no hay distancia, retornar null
  if (distanceKm === null || distanceKm === undefined) {
    return null;
  }

  // Convertir a número si es string
  const distance = typeof distanceKm === 'string' ? parseFloat(distanceKm) : distanceKm;

  // Si no es un número válido, retornar null
  if (isNaN(distance) || distance < 0) {
    return null;
  }

  // Si es menor a 1 km, mostrar en metros
  if (distance < 1) {
    const meters = Math.round(distance * 1000);
    // Si es menor a 100 metros, mostrar "Menos de 100 m"
    if (meters < 100) {
      return "Menos de 100 m";
    }
    return `${meters} m`;
  }

  // Si es mayor o igual a 1 km, mostrar en kilómetros con 1 decimal
  return `${distance.toFixed(1)} km`;
}

/**
 * Formatea la distancia para mostrar en la UI
 * Similar a formatDistance pero con opciones adicionales
 * 
 * @param distanceKm - Distancia en kilómetros
 * @param options - Opciones de formateo
 * @returns Texto formateado
 */
export function formatDistanceWithOptions(
  distanceKm: number | string | null | undefined,
  options?: {
    showLessThan?: boolean; // Mostrar "Menos de X" en lugar de valor exacto
    precision?: number; // Número de decimales (default: 1)
  }
): string | null {
  const { showLessThan = true, precision = 1 } = options || {};

  if (distanceKm === null || distanceKm === undefined) {
    return null;
  }

  const distance = typeof distanceKm === 'string' ? parseFloat(distanceKm) : distanceKm;

  if (isNaN(distance) || distance < 0) {
    return null;
  }

  // Si es menor a 1 km
  if (distance < 1) {
    const meters = Math.round(distance * 1000);
    if (showLessThan && meters < 100) {
      return "Menos de 100 m";
    }
    return `${meters} m`;
  }

  // Si es mayor o igual a 1 km
  return `${distance.toFixed(precision)} km`;
}