import type { CompleteWorkerProfileDto, CompleteWorkerProfileResponseDto } from "../dto/complete-worker-profile.dto";
import { API_CONFIG } from "../../infra/http/api.config";
import { simulateNetworkDelay } from "@/shared/Utils/mockData";
const USE_MOCK_DATA = true; // Cambiar a false cuando el backend esté listo

export class CompleteWorkerProfileUseCase {
    private apiUrl: string;

    constructor(apiUrl?: string) {
        this.apiUrl = apiUrl || API_CONFIG.baseUrl;
    }

    async execute(dto: CompleteWorkerProfileDto, token: string): Promise<CompleteWorkerProfileResponseDto> {
        // Validar que no haya más de 3 servicios
        if (dto.services.length > 3) {
            throw new Error("Máximo 3 servicios permitidos");
        }

        // Validar que cada servicio tenga los campos requeridos
        for (const service of dto.services) {
            if (!service.category_id || !service.title || !service.description) {
                throw new Error("Todos los campos del servicio son obligatorios");
            }
            if (service.base_price < 0) {
                throw new Error("El precio debe ser mayor o igual a 0");
            }
        }

        // Modo mock para desarrollo
        if (USE_MOCK_DATA) {
            await simulateNetworkDelay(1000);
            
            return {
                workerProfileId: `worker-profile-${Date.now()}`,
                servicesCreated: dto.services.length,
                message: 'Perfil de trabajador completado exitosamente',
            };
        }

        try {
            const response = await fetch(`${this.apiUrl}${API_CONFIG.endpoints.workers.completeProfile}`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`,
                },
                body: JSON.stringify({
                    userId: dto.userId,
                    years_experience: dto.years_experience,
                    certification_url: dto.certification_url || null,
                    services: dto.services,
                }),
            });

            if (response.status === 400) {
                const error = await response.json().catch(() => ({ message: 'Datos inválidos' }));
                throw new Error(error.message || 'Datos inválidos');
            }

            if (response.status === 401) {
                throw new Error("No autorizado. Por favor inicia sesión nuevamente");
            }

            if (!response.ok) {
                const error = await response.json().catch(() => ({ message: 'Error al completar perfil' }));
                throw new Error(error.message || 'Error al completar perfil de trabajador');
            }

            const data = await response.json();
            
            return {
                workerProfileId: data.workerProfileId || data.id,
                servicesCreated: data.servicesCreated || dto.services.length,
                message: data.message || 'Perfil de trabajador completado exitosamente',
            };
        } catch (error) {
            // Manejar errores de conexión - usar mock como fallback
            if (error instanceof TypeError && error.message.includes('fetch')) {
                // Fallback a mock si no hay conexión
                await simulateNetworkDelay(1000);
                return {
                    workerProfileId: `worker-profile-${Date.now()}`,
                    servicesCreated: dto.services.length,
                    message: 'Perfil de trabajador completado exitosamente (modo offline)',
                };
            }
            if (error instanceof Error) {
                throw error;
            }
            throw new Error('Error al completar perfil de trabajador');
        }
    }
}

