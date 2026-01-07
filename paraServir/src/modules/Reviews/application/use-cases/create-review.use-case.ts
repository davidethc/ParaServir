import { API_CONFIG } from "../../infra/http/api.config";
import { HttpClientService } from "@/shared/services/http-client.service";
import type { CreateReviewDto } from "../dto/create-review.dto";
import type { ReviewDto } from "../dto/review.dto";

const USE_MOCK_DATA = false;

export class CreateReviewUseCase {
  private apiUrl: string;

  constructor(apiUrl?: string) {
    this.apiUrl = apiUrl || API_CONFIG.baseUrl;
  }

  async execute(dto: CreateReviewDto, token: string): Promise<ReviewDto> {
    if (!token) {
      throw new Error("Token de autenticación requerido");
    }

    if (!dto.request_id || !dto.rating) {
      throw new Error("request_id y rating son requeridos");
    }

    if (dto.rating < 1 || dto.rating > 5) {
      throw new Error("El rating debe estar entre 1 y 5");
    }

    if (USE_MOCK_DATA) {
      await new Promise(resolve => setTimeout(resolve, 500));
      return {
        id: `review-${Date.now()}`,
        request_id: dto.request_id,
        client_id: "mock-client-id",
        worker_id: "mock-worker-id",
        rating: dto.rating,
        comment: dto.comment || null,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      };
    }

    const httpClient = new HttpClientService({ baseUrl: this.apiUrl });
    const endpoint = API_CONFIG.endpoints.reviews.base;
    
    try {
      const response = await httpClient.post<{ status: string; review: ReviewDto }>(
        endpoint,
        dto,
        {
          Authorization: `Bearer ${token}`,
        }
      );
      
      if (response.status === "success" && response.review) {
        return response.review;
      }
      
      throw new Error("Error al crear la reseña");
    } catch (error) {
      if (error instanceof Error) {
        throw new Error(`Error al crear reseña: ${error.message}`);
      }
      throw new Error("Error desconocido al crear reseña");
    }
  }
}

