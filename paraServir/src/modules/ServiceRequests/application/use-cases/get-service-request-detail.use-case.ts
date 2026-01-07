import { API_CONFIG } from "../../infra/http/api.config";
import { HttpClientService } from "@/shared/services/http-client.service";
import type { ServiceRequestDto } from "../dto/service-request.dto";

const USE_MOCK_DATA = false;

export class GetServiceRequestDetailUseCase {
  private apiUrl: string;

  constructor(apiUrl?: string) {
    this.apiUrl = apiUrl || API_CONFIG.baseUrl;
  }

  async execute(requestId: string, token: string): Promise<ServiceRequestDto> {
    if (!token) {
      throw new Error("Token de autenticación requerido");
    }

    if (!requestId) {
      throw new Error("requestId es requerido");
    }

    if (USE_MOCK_DATA) {
      await new Promise(resolve => setTimeout(resolve, 400));
      return {
        id: requestId,
        category_id: "mock-category-id",
        category_name: "Plomería",
        description: "Necesito reparar una fuga",
        address: "Av. Principal 123",
        scheduled_date: new Date().toISOString(),
        status: "pending",
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      };
    }

    const httpClient = new HttpClientService({ baseUrl: this.apiUrl });
    const endpoint = `${API_CONFIG.endpoints.requests.base}/${requestId}`;
    
    try {
      const response = await httpClient.get<ServiceRequestDto>(endpoint, {
        Authorization: `Bearer ${token}`,
      });
      
      return response;
    } catch (error) {
      if (error instanceof Error) {
        throw new Error(`Error al obtener solicitud: ${error.message}`);
      }
      throw new Error("Error desconocido al obtener solicitud");
    }
  }
}

