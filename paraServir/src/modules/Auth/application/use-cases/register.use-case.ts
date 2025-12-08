import type { RegisterDto, RegisterResponseDto } from "../dto/register.dto";
import { API_CONFIG } from "../../infra/http/api.config";
import { simulateNetworkDelay } from "@/shared/Utils/mockData";


const USE_MOCK_DATA = true; // Cambiar a false cuando el backend esté listo

export class RegisterUseCase {
    private apiUrl: string;

    constructor(apiUrl?: string) {
        this.apiUrl = apiUrl || API_CONFIG.baseUrl;
    }

    async execute(dto: RegisterDto): Promise<RegisterResponseDto> {
        // Modo mock para desarrollo
        if (USE_MOCK_DATA) {
            await simulateNetworkDelay(800);
            
            // Simular validación de email duplicado
            const existingEmails = ['test@test.com', 'admin@admin.com'];
            if (existingEmails.includes(dto.email)) {
                throw new Error("El correo electrónico ya está registrado");
            }

            const userId = `user-${Date.now()}`;
            const token = `token-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;

            return {
                userId,
                email: dto.email,
                role: dto.role,
                token,
                nextStep: dto.role === 'trabajador' ? 'complete_worker_profile' : null,
            };
        }

        try {
            // Llamada directa al backend remoto para registro
            const response = await fetch(`${this.apiUrl}${API_CONFIG.endpoints.auth.register}`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    email: dto.email,
                    password: dto.password,
                    firstName: dto.firstName,
                    lastName: dto.lastName,
                    cedula: dto.cedula,
                    phone: dto.phone,
                    location: dto.location,
                    avatar_url: dto.avatar_url || null,
                    role: dto.role,
                }),
            });

            if (response.status === 409) {
                throw new Error("El correo electrónico ya está registrado");
            }

            if (response.status === 400) {
                const error = await response.json().catch(() => ({ message: 'Datos inválidos' }));
                throw new Error(error.message || 'Datos inválidos');
            }

            if (!response.ok) {
                const error = await response.json().catch(() => ({ message: 'Error al registrar usuario' }));
                throw new Error(error.message || 'Error al registrar usuario');
            }

            const data = await response.json();
            
            // El backend devuelve: { userId, role, token?, nextStep? }
            return {
                userId: data.userId || data.id || data.user?.id,
                email: data.email || dto.email,
                role: data.role || dto.role,
                token: data.token || data.access_token || data.accessToken,
                nextStep: data.nextStep || (dto.role === 'trabajador' ? 'complete_worker_profile' : null),
            };
        } catch (error) {
            // Manejar errores de conexión - usar mock como fallback
            if (error instanceof TypeError && error.message.includes('fetch')) {
                // Fallback a mock si no hay conexión
                await simulateNetworkDelay(800);
                const userId = `user-${Date.now()}`;
                const token = `token-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;

                return {
                    userId,
                    email: dto.email,
                    role: dto.role,
                    token,
                    nextStep: dto.role === 'trabajador' ? 'complete_worker_profile' : null,
                };
            }
            if (error instanceof Error) {
                throw error;
            }
            throw new Error('Error al registrar usuario');
        }
    }
}

