import type { CreateBasicServiceDto, CreateBasicServiceResponseDto } from "../dto/create-basic-service.dto";
import { API_CONFIG } from "../../infra/http/api.config";
import { simulateNetworkDelay } from "@/shared/Utils/mockData";

const USE_MOCK_DATA = true; // Cambiar a false cuando el backend esté listo

export class CreateBasicServiceUseCase {
    private apiUrl: string;

    constructor(apiUrl?: string) {
        this.apiUrl = apiUrl || API_CONFIG.baseUrl;
    }

    async execute(dto: CreateBasicServiceDto, token: string): Promise<CreateBasicServiceResponseDto> {
        // Modo mock para desarrollo
        if (USE_MOCK_DATA) {
            await simulateNetworkDelay(800);
            
            const serviceId = `service-${Date.now()}`;
            
            return {
                serviceId,
                message: "Servicio creado exitosamente",
                nextStep: "login",
            };
        }

        try {
            // Calcular base_price basado en price_range si es hourly
            let basePrice: number | null = null;
            if (dto.price_type === 'hourly' && dto.price_range) {
                const [min, max] = dto.price_range.split('-').map(Number);
                basePrice = max ? (min + max) / 2 : min; // Promedio del rango
            }

            const response = await fetch(`${this.apiUrl}${API_CONFIG.endpoints.services.createBasic}`, {
                method: 'POST',
                headers: { 
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify({
                    services: [{
                        category_id: dto.category_id,
                        title: dto.title,
                        description: dto.description,
                        base_price: basePrice,
                    }]
                }),
            });

            if (response.status === 401) {
                throw new Error("No autenticado. Por favor inicia sesión nuevamente.");
            }

            if (response.status === 400) {
                const error = await response.json().catch(() => ({ message: 'Datos inválidos' }));
                throw new Error(error.message || 'Datos inválidos');
            }

            if (!response.ok) {
                const error = await response.json().catch(() => ({ message: 'Error al crear servicio' }));
                throw new Error(error.message || 'Error al crear servicio');
            }

            const data = await response.json();
            
            return {
                serviceId: data.services?.[0]?.id || data.serviceId || `service-${Date.now()}`,
                message: data.message || "Servicio creado exitosamente",
                nextStep: "login",
            };
        } catch (error) {
            // Manejar errores de conexión - usar mock como fallback
            if (error instanceof TypeError && error.message.includes('fetch')) {
                await simulateNetworkDelay(800);
                const serviceId = `service-${Date.now()}`;
                
                return {
                    serviceId,
                    message: "Servicio creado exitosamente (modo offline)",
                    nextStep: "login",
                };
            }
            if (error instanceof Error) {
                throw error;
            }
            throw new Error('Error al crear servicio');
        }
    }
}
