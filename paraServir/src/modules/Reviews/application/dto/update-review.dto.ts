/**
 * DTO para actualizar una reseña
 */
export interface UpdateReviewDto {
  rating?: number; // 1-5
  comment?: string | null;
}

