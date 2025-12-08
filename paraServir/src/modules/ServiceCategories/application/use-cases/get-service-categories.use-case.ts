import type { ServiceCategoryDto } from "../dto/service-category.dto";
import { API_CONFIG } from "../../infra/http/api.config";
import { MOCK_SERVICE_CATEGORIES, simulateNetworkDelay } from "@/shared/Utils/mockData";

const USE_MOCK_DATA = true; // Cambiar a false cuando el backend esté listo

export class GetServiceCategoriesUseCase {
    private apiUrl: string;

    constructor(apiUrl?: string) {
        this.apiUrl = apiUrl || API_CONFIG.baseUrl;
    }

    async execute(): Promise<ServiceCategoryDto[]> {
        // Modo mock para desarrollo
        if (USE_MOCK_DATA) {
            await simulateNetworkDelay(500);
            return MOCK_SERVICE_CATEGORIES;
        }

        try {
            const response = await fetch(`${this.apiUrl}${API_CONFIG.endpoints.serviceCategories.getAll}`, {
                method: 'GET',
                headers: { 'Content-Type': 'application/json' },
            });

            if (!response.ok) {
                const error = await response.json().catch(() => ({ message: 'Failed to fetch categories' }));
                throw new Error(error.message || 'Failed to fetch service categories');
            }

            const data = await response.json();
            
            // El backend puede devolver un array directamente o dentro de un objeto
            if (Array.isArray(data)) {
                return data;
            }
            
            return data.categories || data.data || [];
        } catch (error) {
            // Manejar errores de conexión - usar mock como fallback
            if (error instanceof TypeError && error.message.includes('fetch')) {
                // Fallback a mock si no hay conexión
                await simulateNetworkDelay(500);
                return MOCK_SERVICE_CATEGORIES;
            }
            if (error instanceof Error) {
                throw error;
            }
            throw new Error('Error al cargar categorías de servicios');
        }
    }
}

