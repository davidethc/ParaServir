import { API_CONFIG } from "../../infra/http/api.config";
import { HttpClientService } from "@/shared/services/http-client.service";
import type { UpdateUserDto } from "../dto/update-user.dto";
import type { UserDto } from "../dto/user.dto";

const USE_MOCK_DATA = false;

export class UpdateUserUseCase {
  private apiUrl: string;

  constructor(apiUrl?: string) {
    this.apiUrl = apiUrl || API_CONFIG.baseUrl;
  }

  async execute(userId: string, dto: UpdateUserDto, token: string): Promise<UserDto> {
    if (!token) {
      throw new Error("Token de autenticación requerido");
    }

    if (!userId) {
      throw new Error("userId es requerido");
    }

    if (USE_MOCK_DATA) {
      await new Promise(resolve => setTimeout(resolve, 500));
      return {
        id: userId,
        email: dto.email || "usuario@example.com",
        role: dto.role || "usuario",
        is_verified: true,
        created_at: new Date().toISOString(),
        first_name: dto.first_name || "Usuario",
        last_name: dto.last_name || "Ejemplo",
        cedula: dto.cedula || "1234567890",
        phone: dto.phone || "0999999999",
        location: dto.location || "Quito, Ecuador",
        avatar_url: dto.avatar_url || null,
      };
    }

    const httpClient = new HttpClientService({ baseUrl: this.apiUrl });
    const endpoint = `${API_CONFIG.endpoints.users}/edit/${userId}`;
    
    try {
      const response = await httpClient.put<{ 
        status: string; 
        user: UserDto;
      }>(
        endpoint,
        dto,
        {
          Authorization: `Bearer ${token}`,
        }
      );
      
      if (response.status === "success" && response.user) {
        return response.user;
      }
      
      throw new Error("Error al actualizar el usuario");
    } catch (error) {
      if (error instanceof Error) {
        throw new Error(`Error al actualizar usuario: ${error.message}`);
      }
      throw new Error("Error desconocido al actualizar usuario");
    }
  }
}

