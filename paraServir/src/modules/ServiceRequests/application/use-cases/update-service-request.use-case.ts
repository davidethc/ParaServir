import { API_CONFIG } from "../../infra/http/api.config";
import { HttpClientService } from "@/shared/services/http-client.service";
import { simulateNetworkDelay } from "@/shared/Utils/mockData";

const USE_MOCK_DATA = false;

export interface UpdateServiceRequestDto {
  status?: "pending" | "accepted" | "in_progress" | "completed" | "cancelled";
  scheduled_date?: string;
  address?: string;
}

export class UpdateServiceRequestUseCase {
  private apiUrl: string;

  constructor(apiUrl?: string) {
    this.apiUrl = apiUrl || API_CONFIG.baseUrl;
  }

  async execute(id: string, dto: UpdateServiceRequestDto, token: string) {
    if (!id) throw new Error("ID de solicitud requerido");
    if (!token) throw new Error("Token de autenticación requerido");

    if (USE_MOCK_DATA) {
      await simulateNetworkDelay(300);
      return { status: "success" };
    }

    const httpClient = new HttpClientService({ baseUrl: this.apiUrl });
    const endpoint = `${API_CONFIG.endpoints.requests.base}/${id}`;
    return await httpClient.put(endpoint, dto, {
      Authorization: `Bearer ${token}`,
    });
  }
}
