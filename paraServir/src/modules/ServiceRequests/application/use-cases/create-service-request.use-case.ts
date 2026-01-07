import { API_CONFIG } from "../../infra/http/api.config";
import { HttpClientService } from "@/shared/services/http-client.service";
import type { CreateServiceRequestDto } from "../dto/create-service-request.dto";
import { simulateNetworkDelay } from "@/shared/Utils/mockData";

const USE_MOCK_DATA = false;

export class CreateServiceRequestUseCase {
  private apiUrl: string;

  constructor(apiUrl?: string) {
    this.apiUrl = apiUrl || API_CONFIG.baseUrl;
  }

  async execute(dto: CreateServiceRequestDto, token: string) {
    if (!token) throw new Error("Token de autenticación requerido");

    if (USE_MOCK_DATA) {
      await simulateNetworkDelay(600);
      return { status: "success", id: `req-${Date.now()}` };
    }

    const httpClient = new HttpClientService({ baseUrl: this.apiUrl });
    return await httpClient.post(API_CONFIG.endpoints.requests.base, dto, {
      Authorization: `Bearer ${token}`,
    });
  }
}
