/**
 * DTOs para el módulo de Estadísticas de Trabajadores
 */

export interface WorkerStatsDto {
  requests: {
    total: number;
    pending: number;
    accepted: number;
    in_progress: number;
    completed: number;
    cancelled: number;
  };
  rates: {
    acceptance_rate: number;
    completion_rate: number;
  };
  reviews: {
    average_rating: number;
    total_reviews: number;
  };
  earnings: {
    estimated_earnings: number;
  };
  services: {
    active_services: number;
  };
}

export interface WorkerStatsResponse {
  status: string;
  stats: WorkerStatsDto;
}
