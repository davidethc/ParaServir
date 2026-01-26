/**
 * DTO para representar el perfil completo de un trabajador
 */
export interface WorkerProfileDto {
  id: string;
  email: string;
  role: string;
  is_verified: boolean;
  first_name: string;
  last_name: string;
  cedula: string;
  phone: string;
  avatar_url: string | null;
  location: string | null;
  latitude?: number | null;
  longitude?: number | null;
  years_experience: number | null;
  certification_url: string | null;
  verification_status: 'pending' | 'verified' | 'rejected';
  is_active: boolean;
  distance_km?: number | string | null; // Distancia en kilómetros cuando se busca por ubicación
  category_name?: string | null; // Nombre de la categoría principal del trabajador
  min_price?: number | null; // Precio mínimo de sus servicios
  avg_rating?: number | null; // Calificación promedio
}

