import type { RegisterDto, RegisterResponseDto } from "../dto/register.dto";
import { API_CONFIG } from "../../infra/http/api.config";

export class RegisterUseCase {
    private apiUrl: string;

    constructor(apiUrl?: string) {
        this.apiUrl = apiUrl || API_CONFIG.baseUrl;
    }

    async execute(dto: RegisterDto): Promise<RegisterResponseDto> {
        try {
            // Llamada directa al backend remoto para registro
            const response = await fetch(`${this.apiUrl}${API_CONFIG.endpoints.auth.register}`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    email: dto.email,
                    password: dto.password,
                    role: dto.role || 'usuario',
                }),
            });

            if (response.status === 409) {
                throw new Error("User with this email already exists");
            }

            if (!response.ok) {
                const error = await response.json().catch(() => ({ message: 'Registration failed' }));
                throw new Error(error.message || 'Registration failed');
            }

            const data = await response.json();
            
            // El backend puede devolver los datos en diferentes formatos
            return {
                id: data.id || data.user?.id,
                email: data.email || data.user?.email,
                role: data.role || data.user?.role || 'usuario',
                isVerified: data.is_verified !== undefined ? data.is_verified : (data.isVerified !== undefined ? data.isVerified : false),
            };
        } catch (error) {
            if (error instanceof Error) {
                throw error;
            }
            throw new Error('Failed to register user');
        }
    }
}

