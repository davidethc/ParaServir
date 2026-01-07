/**
 * DTO para representar una reseña completa
 */
export interface ReviewDto {
  id: string;
  request_id: string;
  client_id: string;
  worker_id: string;
  rating: number; // 1-5
  comment: string | null;
  created_at: string;
  updated_at: string;
  // Datos del cliente que hizo la reseña
  client_email?: string;
  client_first_name?: string;
  client_last_name?: string;
  client_avatar?: string | null;
  // Datos de la solicitud
  request_description?: string;
}

/**
 * Respuesta de reseñas de trabajador con promedio
 */
export interface WorkerReviewsResponse {
  reviews: ReviewDto[];
  average_rating: number;
  total_reviews: number;
}

/**
 * Respuesta de reseñas creadas por un cliente
 */
export interface ClientReviewsResponse {
  reviews: ClientReviewDto[];
  average_rating: number;
  total_reviews: number;
}

/**
 * DTO para reseña vista desde el cliente (incluye info del trabajador)
 */
export interface ClientReviewDto {
  id: string;
  request_id: string;
  client_id: string;
  worker_id: string;
  rating: number;
  comment: string | null;
  created_at: string;
  updated_at: string;
  // Datos del trabajador
  worker_email?: string;
  worker_first_name?: string;
  worker_last_name?: string;
  worker_avatar?: string | null;
  // Datos de la solicitud
  request_description?: string;
  service_title?: string;
  category_name?: string;
}

