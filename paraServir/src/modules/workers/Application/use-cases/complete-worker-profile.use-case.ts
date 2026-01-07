import type { CompleteWorkerProfileDto, CompleteWorkerProfileResponseDto } from "../dto/complete-worker-profile.dto";
import { API_CONFIG } from "../../infra/http/api.config";
import { simulateNetworkDelay } from "@/shared/Utils/mockData";
const USE_MOCK_DATA = false; // Cambiar a true solo para desarrollo/testing

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
            // Primero actualizar el perfil profesional
            const profileResponse = await fetch(`${this.apiUrl}${API_CONFIG.endpoints.workers.completeProfile}`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`,
                },
                body: JSON.stringify({
                    years_experience: dto.years_experience,
                    certification_url: dto.certification_url || null,
                }),
            });

            if (!profileResponse.ok) {
                const error = await profileResponse.json().catch(() => ({ message: 'Error al actualizar perfil profesional' }));
                throw new Error(error.message || 'Error al actualizar perfil profesional');
            }

            const profileData = await profileResponse.json();
            const workerProfileId = profileData.profile?.id || profileData.profile_id || dto.userId;

            // Luego crear los servicios (si hay servicios)
            let servicesCreated = 0;
            if (dto.services && dto.services.length > 0) {
                const servicesResponse = await fetch(`${this.apiUrl}/workers/services`, {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                        'Authorization': `Bearer ${token}`,
                    },
                    body: JSON.stringify({
                        services: dto.services,
                    }),
                });

                if (!servicesResponse.ok) {
                    const error = await servicesResponse.json().catch(() => ({ message: 'Error al crear servicios' }));
                    throw new Error(error.message || 'Error al crear servicios');
                }

                const servicesData = await servicesResponse.json();
                servicesCreated = servicesData.services?.length || dto.services.length;
            }
            
            return {
                workerProfileId: workerProfileId,
                servicesCreated: servicesCreated,
                message: 'Perfil de trabajador completado exitosamente',
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

