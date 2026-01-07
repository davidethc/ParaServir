import { API_CONFIG } from "../../infra/http/api.config";
import { HttpClientService } from "@/shared/services/http-client.service";
import type { ClientReviewsResponse } from "../dto/review.dto";

const USE_MOCK_DATA = false;

export class GetClientReviewsUseCase {
  private apiUrl: string;

  constructor(apiUrl?: string) {
    this.apiUrl = apiUrl || API_CONFIG.baseUrl;
  }

  async execute(token: string): Promise<ClientReviewsResponse> {
    if (!token) {
      throw new Error("Token de autenticación requerido");
    }

    if (USE_MOCK_DATA) {
      await new Promise(resolve => setTimeout(resolve, 500));
      return {
        reviews: [
          {
            id: "review-1",
            request_id: "req-1",
            client_id: "client-1",
            worker_id: "worker-1",
            rating: 5,
            comment: "Excelente trabajo, muy profesional.",
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString(),
            worker_first_name: "Juan",
            worker_last_name: "Pérez",
            worker_email: "juan@example.com",
            request_description: "Reparación de tubería",
            service_title: "Plomería",
            category_name: "Fontanería",
          },
        ],
        average_rating: 5.0,
        total_reviews: 1,
      };
    }

    const httpClient = new HttpClientService({ baseUrl: this.apiUrl });
    const response = await httpClient.get<{ status: string } & ClientReviewsResponse>(
      API_CONFIG.endpoints.reviews.client,
      { Authorization: `Bearer ${token}` }
    );

    if (response.status === "success") {
      return {
        reviews: response.reviews || [],
        average_rating: response.average_rating || 0,
        total_reviews: response.total_reviews || 0,
      };
    }

    throw new Error("Error al obtener las reseñas");
  }
}

