import { API_CONFIG } from "../../infra/http/api.config";
import { HttpClientService } from "@/shared/services/http-client.service";
import { simulateNetworkDelay } from "@/shared/Utils/mockData";
import type { ServiceRequestDto } from "../dto/service-request.dto";

const USE_MOCK_DATA = false;

interface ListParams {
  status?: string;
  as_client?: boolean;
  as_worker?: boolean;
}

export class ListServiceRequestsUseCase {
  private apiUrl: string;

  constructor(apiUrl?: string) {
    this.apiUrl = apiUrl || API_CONFIG.baseUrl;
  }

  async execute(token: string, params: ListParams): Promise<ServiceRequestDto[]> {
    if (!token) throw new Error("Token de autenticación requerido");

    if (USE_MOCK_DATA) {
      await simulateNetworkDelay(400);
      return [];
    }

    const httpClient = new HttpClientService({ baseUrl: this.apiUrl });
    const query = new URLSearchParams();
    if (params.status) query.set("status", params.status);
    if (params.as_client) query.set("as_client", "true");
    if (params.as_worker) query.set("as_worker", "true");

    const endpoint = `${API_CONFIG.endpoints.requests.base}?${query.toString()}`;
    const data = await httpClient.get<{ status?: string; requests?: ServiceRequestDto[]; service_requests?: ServiceRequestDto[] }>(endpoint, {
      Authorization: `Bearer ${token}`,
    });
    // El backend devuelve "requests" pero mantenemos compatibilidad con "service_requests"
    const requests = data.requests || data.service_requests || [];
    return requests;
  }
}
