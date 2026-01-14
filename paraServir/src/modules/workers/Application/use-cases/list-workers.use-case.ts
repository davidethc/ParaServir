import { API_CONFIG } from "../../infra/http/api.config";
import { HttpClientService } from "@/shared/services/http-client.service";
import type { WorkerProfileDto } from "../dto/worker-profile.dto";

const USE_MOCK_DATA = false;

export class ListWorkersUseCase {
  private apiUrl: string;

  constructor(apiUrl?: string) {
    this.apiUrl = apiUrl || API_CONFIG.baseUrl;
  }

  async execute(token?: string): Promise<WorkerProfileDto[]> {
    if (USE_MOCK_DATA) {
      await new Promise(resolve => setTimeout(resolve, 400));
      return [];
    }

    const httpClient = new HttpClientService({ baseUrl: this.apiUrl });
    const endpoint = API_CONFIG.endpoints.workers.list;
    
    try {
      const headers: Record<string, string> = {};
      if (token) {
        headers.Authorization = `Bearer ${token}`;
      }

      const response = await httpClient.get<{ 
        status: string; 
        rows: WorkerProfileDto[];
      }>(endpoint, headers);
      
      if (response.status === "success" && response.rows) {
        return response.rows;
      }
      
      return [];
    } catch (error) {
      if (error instanceof Error) {
        throw new Error(`Error al obtener trabajadores: ${error.message}`);
      }
      throw new Error("Error desconocido al obtener trabajadores");
    }
  }
}

