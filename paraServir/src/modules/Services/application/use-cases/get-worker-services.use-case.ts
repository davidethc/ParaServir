import { API_CONFIG } from "../../infra/http/api.config";
import { HttpClientService } from "@/shared/services/http-client.service";
import { simulateNetworkDelay } from "@/shared/Utils/mockData";
import type { WorkerServiceDto } from "../dto/worker-service.dto";

const USE_MOCK_DATA = false;

export class GetWorkerServicesUseCase {
  private apiUrl: string;

  constructor(apiUrl?: string) {
    this.apiUrl = apiUrl || API_CONFIG.baseUrl;
  }

  async execute(workerId: string, token: string): Promise<WorkerServiceDto[]> {
    if (!workerId) {
      throw new Error("workerId requerido para listar servicios");
    }
    if (!token) {
      throw new Error("Token de autenticación requerido");
    }

    if (USE_MOCK_DATA) {
      await simulateNetworkDelay(600);
      return [];
    }

    const httpClient = new HttpClientService({ baseUrl: this.apiUrl });
    const endpoint = API_CONFIG.endpoints.services.listByWorker(workerId);

    const data = await httpClient.get<{ services?: WorkerServiceDto[] }>(
      endpoint,
      { Authorization: `Bearer ${token}` }
    );

    return data.services || [];
  }
}
