import { UserNotFoundError } from "../../../Users/Domain/errors/UserNotFoundError";
import type { LoginDto, LoginResponseDto } from "../dto/login.dto";
import { API_CONFIG } from "../../infra/http/api.config";
import { HttpClientService } from "@/shared/services/http-client.service";
import { mapLoginResponse } from "@/shared/Utils/dto-mapper";

const USE_MOCK_DATA = false; // Conectado al backend real

export class LoginUseCase {
    private httpClient: HttpClientService;

    constructor(apiUrl?: string) {
        const baseUrl = apiUrl || API_CONFIG.baseUrl;
        this.httpClient = new HttpClientService({ baseUrl });
    }

    async execute(dto: LoginDto): Promise<LoginResponseDto> {
        // Modo mock para desarrollo (solo si USE_MOCK_DATA = true)
        if (USE_MOCK_DATA) {
            const { simulateNetworkDelay } = await import("@/shared/Utils/mockData");
            await simulateNetworkDelay(800);
            
            if (dto.email === 'test@test.com' && dto.password === 'password123') {
                return {
                    token: `token-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
                    user: {
                        id: 'user-123',
                        email: dto.email,
                        role: 'usuario',
                    },
                };
            }
            
            if (dto.email === 'worker@test.com' && dto.password === 'password123') {
                return {
                    token: `token-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
                    user: {
                        id: 'worker-123',
                        email: dto.email,
                        role: 'trabajador',
                    },
                };
            }
            
            throw new UserNotFoundError("Correo o contraseña incorrectos");
        }

        try {
            // Llamada al backend real
            const backendResponse = await this.httpClient.post<{
                status?: string;
                message?: string;
                user?: { id: string; email: string; role: string };
                token?: string;
            }>(API_CONFIG.endpoints.auth.login, {
                email: dto.email,
                password: dto.password,
            });

            // Mapear respuesta del backend al formato del frontend
            return mapLoginResponse(backendResponse);
        } catch (error) {
            // Manejar errores específicos
            if (error instanceof Error) {
                // Si es error de credenciales
                if (error.message.includes('Credenciales incorrectas') || 
                    error.message.includes('Invalid email') ||
                    error.message.includes('password')) {
                    throw new UserNotFoundError("Correo o contraseña incorrectos");
                }
                throw error;
            }
            throw new Error('Error al iniciar sesión');
        }
    }
}

