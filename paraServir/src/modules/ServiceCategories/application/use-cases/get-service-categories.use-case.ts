import type { ServiceCategoryDto } from "../dto/service-category.dto";
import { API_CONFIG } from "../../infra/http/api.config";
import { HttpClientService } from "@/shared/services/http-client.service";

const USE_MOCK_DATA = false; // Conectado al backend real

export class GetServiceCategoriesUseCase {
    private httpClient: HttpClientService;

    constructor(apiUrl?: string) {
        const baseUrl = apiUrl || API_CONFIG.baseUrl;
        this.httpClient = new HttpClientService({ baseUrl });
    }

    async execute(): Promise<ServiceCategoryDto[]> {
        // Modo mock para desarrollo (solo si USE_MOCK_DATA = true)
        if (USE_MOCK_DATA) {
            const { MOCK_SERVICE_CATEGORIES, simulateNetworkDelay } = await import("@/shared/Utils/mockData");
            await simulateNetworkDelay(500);
            return MOCK_SERVICE_CATEGORIES;
        }

        try {
            // Llamada al backend real
            const backendResponse = await this.httpClient.get<{
                status?: string;
                rows?: Array<{
                    id: string;
                    name: string;
                    description?: string;
                    icon?: string;
                }>;
            }>(API_CONFIG.endpoints.serviceCategories.getAll);

            // El backend devuelve: { status: "success", rows: [...] }
            const categories = backendResponse.rows || [];

            // Mapear respuesta del backend al formato del frontend
            return categories.map((cat) => ({
                id: cat.id,
                name: cat.name,
                description: cat.description || undefined,
                icon: cat.icon || undefined,
                // jobCount no viene del backend, se puede calcular después si es necesario
            }));
        } catch (error) {
            // Manejar errores específicos
            if (error instanceof Error) {
                throw error;
            }
            throw new Error('Error al cargar categorías de servicios');
        }
    }
}

