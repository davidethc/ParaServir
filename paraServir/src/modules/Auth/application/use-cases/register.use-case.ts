import type { RegisterDto, RegisterResponseDto } from "../dto/register.dto";
import { API_CONFIG } from "../../infra/http/api.config";
import { HttpClientService } from "@/shared/services/http-client.service";
import { mapRegisterRequest, mapRegisterResponse } from "@/shared/Utils/dto-mapper";

const USE_MOCK_DATA = false; // Conectado al backend real

export class RegisterUseCase {
    private httpClient: HttpClientService;

    constructor(apiUrl?: string) {
        const baseUrl = apiUrl || API_CONFIG.baseUrl;
        this.httpClient = new HttpClientService({ baseUrl });
    }

    async execute(dto: RegisterDto): Promise<RegisterResponseDto> {
        // Modo mock para desarrollo (solo si USE_MOCK_DATA = true)
        if (USE_MOCK_DATA) {
            const { simulateNetworkDelay } = await import("@/shared/Utils/mockData");
            await simulateNetworkDelay(800);
            
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
            // Transformar DTO de frontend (camelCase) a formato backend (snake_case)
            const requestData = mapRegisterRequest(dto);

            // Llamada al backend real
            const backendResponse = await this.httpClient.post<{
                message?: string;
                user?: { id: string; email: string; role: string; is_verified?: boolean };
                token?: string;
            }>(API_CONFIG.endpoints.auth.register, requestData);

            // Mapear respuesta del backend al formato del frontend
            return mapRegisterResponse(backendResponse);
        } catch (error) {
            // Manejar errores específicos
            if (error instanceof Error) {
                // Si es error de email duplicado
                if (error.message.includes('Ya existe un usuario con ese email') ||
                    error.message.includes('email ya está registrado') ||
                    error.message.includes('duplicate')) {
                    throw new Error("El correo electrónico ya está registrado");
                }
                // Si es error de validación
                if (error.message.includes('Datos inválidos') ||
                    error.message.includes('validation')) {
                    throw new Error("Datos inválidos. Por favor verifica la información ingresada.");
                }
                throw error;
            }
            throw new Error('Error al registrar usuario');
        }
    }
}

