/**
 * DTO para crear una nueva reseña
 */
export interface CreateReviewDto {
  request_id: string;
  rating: number; // 1-5
  comment?: string | null;
}

