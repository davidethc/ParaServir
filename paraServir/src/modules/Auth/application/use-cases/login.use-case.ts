import { UserNotFoundError } from "../../../Users/Domain/errors/UserNotFoundError";
import type { LoginDto, LoginResponseDto } from "../dto/login.dto";
import { API_CONFIG } from "../../infra/http/api.config";
import { simulateNetworkDelay } from "@/shared/Utils/mockData";

const USE_MOCK_DATA = true; // Cambiar a false cuando el backend esté listo

export class LoginUseCase {
    private apiUrl: string;

    constructor(apiUrl?: string) {
        this.apiUrl = apiUrl || API_CONFIG.baseUrl;
    }

    async execute(dto: LoginDto): Promise<LoginResponseDto> {
        // Modo mock para desarrollo
        if (USE_MOCK_DATA) {
            await simulateNetworkDelay(800);
            
            // Simular credenciales válidas
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
            
            // Simular credenciales de trabajador
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
            // Llamada directa al backend remoto para autenticación
            const response = await fetch(`${this.apiUrl}${API_CONFIG.endpoints.auth.login}`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    email: dto.email,
                    password: dto.password,
                }),
            });

            if (response.status === 401 || response.status === 404) {
                throw new UserNotFoundError("Invalid email or password");
            }

            if (!response.ok) {
                const error = await response.json().catch(() => ({ message: 'Login failed' }));
                throw new Error(error.message || 'Login failed');
            }

            const data = await response.json();
            
            // El backend puede devolver el token y user en diferentes formatos
            return {
                token: data.token || data.access_token || data.accessToken,
                user: {
                    id: data.user?.id || data.id,
                    email: data.user?.email || data.email,
                    role: data.user?.role || data.role,
                },
            };
        } catch (error) {
            // Manejar errores de conexión - usar mock como fallback
            if (error instanceof TypeError && error.message.includes('fetch')) {
                // Fallback a mock si no hay conexión
                await simulateNetworkDelay(800);
                return {
                    token: `token-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
                    user: {
                        id: 'user-mock',
                        email: dto.email,
                        role: 'usuario',
                    },
                };
            }
            if (error instanceof UserNotFoundError) {
                throw error;
            }
            if (error instanceof Error) {
                throw error;
            }
            throw new Error('Error al iniciar sesión');
        }
    }
}

