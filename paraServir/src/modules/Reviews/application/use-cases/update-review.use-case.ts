import { API_CONFIG } from "../../infra/http/api.config";
import { HttpClientService } from "@/shared/services/http-client.service";
import type { UpdateReviewDto } from "../dto/update-review.dto";
import type { ReviewDto } from "../dto/review.dto";

const USE_MOCK_DATA = false;

export class UpdateReviewUseCase {
  private apiUrl: string;

  constructor(apiUrl?: string) {
    this.apiUrl = apiUrl || API_CONFIG.baseUrl;
  }

  async execute(reviewId: string, dto: UpdateReviewDto, token: string): Promise<ReviewDto> {
    if (!token) {
      throw new Error("Token de autenticación requerido");
    }

    if (!reviewId) {
      throw new Error("reviewId es requerido");
    }

    if (dto.rating !== undefined && (dto.rating < 1 || dto.rating > 5)) {
      throw new Error("El rating debe estar entre 1 y 5");
    }

    if (USE_MOCK_DATA) {
      await new Promise(resolve => setTimeout(resolve, 400));
      return {
        id: reviewId,
        request_id: "mock-request-id",
        client_id: "mock-client-id",
        worker_id: "mock-worker-id",
        rating: dto.rating || 5,
        comment: dto.comment || null,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      };
    }

    const httpClient = new HttpClientService({ baseUrl: this.apiUrl });
    const endpoint = API_CONFIG.endpoints.reviews.byId(reviewId);
    
    try {
      const response = await httpClient.put<{ 
        status: string; 
        review: ReviewDto;
      }>(
        endpoint,
        dto,
        {
          Authorization: `Bearer ${token}`,
        }
      );
      
      if (response.status === "success" && response.review) {
        return response.review;
      }
      
      throw new Error("Error al actualizar la reseña");
    } catch (error) {
      if (error instanceof Error) {
        throw new Error(`Error al actualizar reseña: ${error.message}`);
      }
      throw new Error("Error desconocido al actualizar reseña");
    }
  }
}

