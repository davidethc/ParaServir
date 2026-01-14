import { API_CONFIG } from "../../infra/http/api.config";
import { HttpClientService } from "@/shared/services/http-client.service";
import type { WorkerProfileDto } from "../dto/worker-profile.dto";

const USE_MOCK_DATA = false;

export class GetWorkerProfileUseCase {
  private apiUrl: string;

  constructor(apiUrl?: string) {
    this.apiUrl = apiUrl || API_CONFIG.baseUrl;
  }

  async execute(workerId: string): Promise<WorkerProfileDto> {
    if (!workerId) {
      throw new Error("workerId es requerido");
    }

    if (USE_MOCK_DATA) {
      await new Promise(resolve => setTimeout(resolve, 400));
      return {
        id: workerId,
        email: "trabajador@example.com",
        role: "trabajador",
        is_verified: true,
        first_name: "Juan",
        last_name: "Pérez",
        cedula: "1712345678",
        phone: "0999999999",
        avatar_url: null,
        location: "Quito, Ecuador",
        years_experience: 5,
        certification_url: null,
        verification_status: "verified",
        is_active: true,
      };
    }

    const httpClient = new HttpClientService({ baseUrl: this.apiUrl });
    const endpoint = `${API_CONFIG.endpoints.workers.base}/watch/${workerId}`;
    
    try {
      const response = await httpClient.get<{ 
        status: string; 
        rows: WorkerProfileDto[];
      }>(endpoint);
      
      if (response.status === "success" && response.rows && response.rows.length > 0) {
        return response.rows[0];
      }
      
      throw new Error("Trabajador no encontrado");
    } catch (error) {
      if (error instanceof Error) {
        throw new Error(`Error al obtener perfil: ${error.message}`);
      }
      throw new Error("Error desconocido al obtener perfil");
    }
  }
}

