import { API_CONFIG } from "../../infra/http/api.config";
import { HttpClientService } from "@/shared/services/http-client.service";

const USE_MOCK_DATA = false;

export class DeleteUserUseCase {
  private apiUrl: string;

  constructor(apiUrl?: string) {
    this.apiUrl = apiUrl || API_CONFIG.baseUrl;
  }

  async execute(userId: string, token: string): Promise<void> {
    if (!token) {
      throw new Error("Token de autenticación requerido");
    }

    if (!userId) {
      throw new Error("userId es requerido");
    }

    if (USE_MOCK_DATA) {
      await new Promise(resolve => setTimeout(resolve, 500));
      return;
    }

    const httpClient = new HttpClientService({ baseUrl: this.apiUrl });
    const endpoint = `${API_CONFIG.endpoints.users}/delete/${userId}`;
    
    try {
      await httpClient.delete<{ 
        status: string; 
        message: string;
      }>(
        endpoint,
        {
          Authorization: `Bearer ${token}`,
        }
      );
    } catch (error) {
      if (error instanceof Error) {
        throw new Error(`Error al eliminar cuenta: ${error.message}`);
      }
      throw new Error("Error desconocido al eliminar cuenta");
    }
  }
}

