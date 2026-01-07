import { API_CONFIG } from "../../infra/http/api.config";
import { HttpClientService } from "@/shared/services/http-client.service";

const USE_MOCK_DATA = false;

export class DeleteReviewUseCase {
  private apiUrl: string;

  constructor(apiUrl?: string) {
    this.apiUrl = apiUrl || API_CONFIG.baseUrl;
  }

  async execute(reviewId: string, token: string): Promise<void> {
    if (!token) {
      throw new Error("Token de autenticación requerido");
    }

    if (!reviewId) {
      throw new Error("reviewId es requerido");
    }

    if (USE_MOCK_DATA) {
      await new Promise(resolve => setTimeout(resolve, 300));
      return;
    }

    const httpClient = new HttpClientService({ baseUrl: this.apiUrl });
    const endpoint = API_CONFIG.endpoints.reviews.byId(reviewId);
    
    try {
      await httpClient.delete<{ 
        status: string; 
        message: string;
      }>(
        endpoint,
        {
          Authorization: `Bearer ${token}`,
        }
      );
    } catch (error) {
      if (error instanceof Error) {
        throw new Error(`Error al eliminar reseña: ${error.message}`);
      }
      throw new Error("Error desconocido al eliminar reseña");
    }
  }
}

