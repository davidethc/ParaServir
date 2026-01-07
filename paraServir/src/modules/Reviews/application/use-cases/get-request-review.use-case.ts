import { API_CONFIG } from "../../infra/http/api.config";
import { HttpClientService } from "@/shared/services/http-client.service";
import type { ReviewDto } from "../dto/review.dto";

const USE_MOCK_DATA = false;

export class GetRequestReviewUseCase {
  private apiUrl: string;

  constructor(apiUrl?: string) {
    this.apiUrl = apiUrl || API_CONFIG.baseUrl;
  }

  async execute(requestId: string): Promise<ReviewDto | null> {
    if (!requestId) {
      throw new Error("requestId es requerido");
    }

    if (USE_MOCK_DATA) {
      await new Promise(resolve => setTimeout(resolve, 300));
      return null;
    }

    const httpClient = new HttpClientService({ baseUrl: this.apiUrl });
    const endpoint = API_CONFIG.endpoints.reviews.request(requestId);
    
    try {
      const response = await httpClient.get<{ 
        status: string; 
        review: ReviewDto;
      }>(endpoint);
      
      if (response.status === "success" && response.review) {
        return response.review;
      }
      
      return null;
    } catch (error) {
      // Si no se encuentra reseña, retornar null (no es un error crítico)
      if (error instanceof Error && error.message.includes("404")) {
        return null;
      }
      
      if (error instanceof Error) {
        throw new Error(`Error al obtener reseña: ${error.message}`);
      }
      throw new Error("Error desconocido al obtener reseña");
    }
  }
}

