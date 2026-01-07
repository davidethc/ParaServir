import { API_CONFIG } from "../../infra/http/api.config";
import { HttpClientService } from "@/shared/services/http-client.service";
import type { UpdateServiceDto } from "../dto/update-service.dto";
import { simulateNetworkDelay } from "@/shared/Utils/mockData";

const USE_MOCK_DATA = false;

export class UpdateServiceUseCase {
  private apiUrl: string;

  constructor(apiUrl?: string) {
    this.apiUrl = apiUrl || API_CONFIG.baseUrl;
  }

  async execute(serviceId: string, dto: UpdateServiceDto, token: string) {
    if (!serviceId) throw new Error("serviceId requerido");
    if (!token) throw new Error("Token de autenticación requerido");

    if (USE_MOCK_DATA) {
      await simulateNetworkDelay(400);
      return { status: "success", message: "Servicio actualizado (mock)" };
    }

    const httpClient = new HttpClientService({ baseUrl: this.apiUrl });
    const endpoint = `${API_CONFIG.endpoints.services.createBasic}/${serviceId}`;

    return await httpClient.put(endpoint, dto, {
      Authorization: `Bearer ${token}`,
    });
  }
}
