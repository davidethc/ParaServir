import { API_CONFIG } from "../../infra/http/api.config";
import { HttpClientService } from "@/shared/services/http-client.service";

const USE_MOCK_DATA = false;

export class VerifyEmailUseCase {
  private apiUrl: string;

  constructor(apiUrl?: string) {
    this.apiUrl = apiUrl || API_CONFIG.baseUrl;
  }

  async execute(token: string): Promise<{ status: string; message: string }> {
    if (!token) {
      throw new Error("Token de verificación es requerido");
    }

    if (USE_MOCK_DATA) {
      await new Promise(resolve => setTimeout(resolve, 500));
      return {
        status: "success",
        message: "Email verificado correctamente",
      };
    }

    const httpClient = new HttpClientService({ baseUrl: this.apiUrl });
    const endpoint = `${API_CONFIG.endpoints.auth.verifyEmail}?token=${encodeURIComponent(token)}`;
    
    try {
      const response = await httpClient.get<{ 
        status: string; 
        message: string;
      }>(endpoint);
      
      return response;
    } catch (error) {
      if (error instanceof Error) {
        throw new Error(`Error al verificar email: ${error.message}`);
      }
      throw new Error("Error desconocido al verificar email");
    }
  }
}

