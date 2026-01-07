import { API_CONFIG } from "../../infra/http/api.config";
import { HttpClientService } from "@/shared/services/http-client.service";
import type { WorkerReviewsResponse } from "../dto/review.dto";

const USE_MOCK_DATA = false;

export class GetWorkerReviewsUseCase {
  private apiUrl: string;

  constructor(apiUrl?: string) {
    this.apiUrl = apiUrl || API_CONFIG.baseUrl;
  }

  async execute(workerId: string): Promise<WorkerReviewsResponse> {
    if (!workerId) {
      throw new Error("workerId es requerido");
    }

    if (USE_MOCK_DATA) {
      await new Promise(resolve => setTimeout(resolve, 400));
      return {
        reviews: [],
        average_rating: 0,
        total_reviews: 0,
      };
    }

    const httpClient = new HttpClientService({ baseUrl: this.apiUrl });
    const endpoint = API_CONFIG.endpoints.reviews.worker(workerId);
    
    try {
      const response = await httpClient.get<{ 
        status: string; 
        reviews: WorkerReviewsResponse['reviews'];
        average_rating: number;
        total_reviews: number;
      }>(endpoint);
      
      if (response.status === "success") {
        return {
          reviews: response.reviews || [],
          average_rating: response.average_rating || 0,
          total_reviews: response.total_reviews || 0,
        };
      }
      
      throw new Error("Error al obtener las reseñas");
    } catch (error) {
      if (error instanceof Error) {
        throw new Error(`Error al obtener reseñas: ${error.message}`);
      }
      throw new Error("Error desconocido al obtener reseñas");
    }
  }
}

