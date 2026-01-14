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
      // Usar silent404=true para no lanzar error cuando no hay reseña (404 es normal)
      const response = await httpClient.get<{ 
        status: string; 
        review: ReviewDto;
      } | null>(endpoint, undefined, true);
      
      // Si response es null (404 silenciado), retornar null
      if (!response) {
        return null;
      }
      
      if (response.status === "success" && response.review) {
        return response.review;
      }
      
      return null;
    } catch (error) {
      // Solo lanzar error si no es un 404 (que ya fue manejado con silent404)
      if (error instanceof Error) {
        const errorMsg = error.message.toLowerCase();
        // Si es 404, retornar null (aunque debería haber sido manejado por silent404)
        if (
          errorMsg.includes("404") || 
          errorMsg.includes("no encontrado") || 
          errorMsg.includes("not found") ||
          errorMsg.includes("no se encontró reseña") ||
          errorMsg.includes("recurso no encontrado")
        ) {
          return null;
        }
        // Para otros errores, lanzar el error
        throw new Error(`Error al obtener reseña: ${error.message}`);
      }
      throw new Error("Error desconocido al obtener reseña");
    }
  }
}

