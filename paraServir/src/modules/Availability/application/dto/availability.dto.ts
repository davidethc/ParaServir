/**
 * DTOs para el módulo de Disponibilidad de Trabajadores
 */

export interface AvailabilityDayDto {
  id?: string;
  worker_id?: string;
  day_of_week: number; // 0 = Domingo, 1 = Lunes, ..., 6 = Sábado
  start_time?: string | null; // Formato HH:MM o HH:MM:SS
  end_time?: string | null; // Formato HH:MM o HH:MM:SS
  is_available: boolean;
  created_at?: string;
  updated_at?: string;
}

export interface AvailabilityResponse {
  status: string;
  availability: AvailabilityDayDto[];
  count: number;
}

export interface UpdateAvailabilityRequest {
  availability: AvailabilityDayDto[];
}

export const DAY_NAMES = [
  "Domingo",
  "Lunes",
  "Martes",
  "Miércoles",
  "Jueves",
  "Viernes",
  "Sábado",
] as const;
