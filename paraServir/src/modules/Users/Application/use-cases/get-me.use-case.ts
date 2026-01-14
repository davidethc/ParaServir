import { API_CONFIG } from "../../infra/http/api.config";
import { HttpClientService } from "@/shared/services/http-client.service";
import type { UserDto } from "../dto/user.dto";

const USE_MOCK_DATA = false;

export class GetMeUseCase {
  private apiUrl: string;

  constructor(apiUrl?: string) {
    this.apiUrl = apiUrl || API_CONFIG.baseUrl;
  }

  async execute(token: string): Promise<UserDto> {
    if (!token) {
      throw new Error("Token de autenticación requerido");
    }

    if (USE_MOCK_DATA) {
      // Mock data para desarrollo
      return {
        id: "mock-user-id",
        email: "usuario@example.com",
        role: "usuario",
        is_verified: true,
        created_at: new Date().toISOString(),
        first_name: "Usuario",
        last_name: "Ejemplo",
        cedula: "1234567890",
        phone: "0999999999",
        location: "Quito, Ecuador",
        avatar_url: null,
      };
    }

    const httpClient = new HttpClientService({ baseUrl: this.apiUrl });
    const endpoint = `${API_CONFIG.endpoints.users}/me`;
    
    try {
      const response = await httpClient.get<{ status: string; user: UserDto }>(endpoint, {
        Authorization: `Bearer ${token}`,
      });
      
      if (response.status === "success" && response.user) {
        return response.user;
      }
      
      throw new Error("Error al obtener perfil: respuesta inválida");
    } catch (error) {
      if (error instanceof Error) {
        throw new Error(`Error al obtener perfil: ${error.message}`);
      }
      throw new Error("Error desconocido al obtener perfil");
    }
  }
}

