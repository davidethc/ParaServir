import { UserNotFoundError } from "../../../Users/Domain/errors/UserNotFoundError";
import type { LoginDto, LoginResponseDto } from "../dto/login.dto";
import { API_CONFIG } from "../../infra/http/api.config";

export class LoginUseCase {
    private apiUrl: string;

    constructor(apiUrl?: string) {
        this.apiUrl = apiUrl || API_CONFIG.baseUrl;
    }

    async execute(dto: LoginDto): Promise<LoginResponseDto> {
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
            if (error instanceof UserNotFoundError) {
                throw error;
            }
            throw new Error('Failed to login');
        }
    }
}

