import { HttpClientService } from "@/shared/services/http-client.service";
import type { WorkerStatsResponse } from "../../../application/dto/worker-stats.dto";
import { API_CONFIG } from "../api.config";

export class WorkerStatsController {
  private httpClient: HttpClientService;
  private apiUrl: string;

  constructor(apiUrl?: string) {
    this.apiUrl = apiUrl || API_CONFIG.baseUrl;
    this.httpClient = new HttpClientService({ baseUrl: this.apiUrl });
  }

  async getStats(token: string): Promise<WorkerStatsResponse> {
    const response = await this.httpClient.get<WorkerStatsResponse>(
      API_CONFIG.endpoints.workerStats.base,
      { Authorization: `Bearer ${token}` }
    );

    return response;
  }
}
