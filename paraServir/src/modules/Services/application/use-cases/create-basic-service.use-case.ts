import type { CreateBasicServiceDto, CreateBasicServiceResponseDto } from "../dto/create-basic-service.dto";
import { API_CONFIG } from "../../infra/http/api.config";
import { HttpClientService } from "@/shared/services/http-client.service";
import { simulateNetworkDelay } from "@/shared/Utils/mockData";

const USE_MOCK_DATA = false; // Conectado al backend real

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

        if (!token) {
            throw new Error("Token de autenticación requerido");
        }

        try {
            // Calcular base_price basado en price_range si es hourly
            let basePrice: number | null = null;
            if (dto.price_type === 'hourly' && dto.price_range) {
                const [min, max] = dto.price_range.split('-').map(Number);
                basePrice = max ? (min + max) / 2 : min; // Promedio del rango
            }

            // Usar HttpClientService para manejar automáticamente el token
            const httpClient = new HttpClientService({ baseUrl: this.apiUrl });

            // El backend espera un array de services y ubicación
            const requestBody: any = {
                services: [{
                    category_id: dto.category_id,
                    title: dto.title,
                    description: dto.description,
                    base_price: basePrice,
                }]
            };

            // Agregar ubicación si está disponible
            if (dto.address || (dto.latitude && dto.longitude)) {
                requestBody.address = dto.address;
                requestBody.latitude = dto.latitude;
                requestBody.longitude = dto.longitude;
            }

            // Usar el token pasado como parámetro directamente en los headers
            // Esto asegura que usamos el token correcto, no el de localStorage
            const data = await httpClient.post<{
                status?: string;
                message?: string;
                services?: Array<{ id: string; title: string; description: string; base_price: number }>;
                serviceId?: string;
            }>(API_CONFIG.endpoints.services.createBasic, requestBody, {
                'Authorization': `Bearer ${token}`
            });
            
            return {
                serviceId: data.services?.[0]?.id || data.serviceId || `service-${Date.now()}`,
                message: data.message || "Servicio creado exitosamente",
                nextStep: "login",
            };
        } catch (error) {
            // Manejar errores específicos
            if (error instanceof Error) {
                // Si el error menciona 403 o "No autorizado", verificar el rol
                if (error.message.includes('403') || error.message.includes('No autorizado') || error.message.includes('permisos')) {
                    throw new Error("No tienes permisos para crear servicios. Asegúrate de estar registrado como trabajador.");
                }
                // Si el error menciona 401 o "No autenticado", verificar el token
                if (error.message.includes('401') || error.message.includes('No autenticado') || error.message.includes('Token')) {
                    throw new Error("Sesión expirada. Por favor inicia sesión nuevamente.");
                }
                throw error;
            }
            throw new Error('Error al crear servicio');
        }
    }
}
