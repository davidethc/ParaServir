import { HttpClientService } from "@/shared/services/http-client.service";
import { API_CONFIG } from "../../infra/http/api.config";

export interface CategoryDetailDto {
  category: {
    id: string;
    name: string;
    description?: string;
    icon?: string;
    workers_count: number;
    services_count: number;
  };
  workers: Array<{
    worker_id: string;
    first_name: string;
    last_name: string;
    phone?: string;
    location?: string;
    avatar_url?: string;
    years_experience?: number;
    verification_status: string;
    is_active: boolean;
    services_count: number;
    min_price?: number;
    max_price?: number;
  }>;
  services: Array<{
    id: string;
    title: string;
    description: string;
    base_price?: number;
    is_available: boolean;
    worker_id: string;
    worker_name: string;
  }>;
}

const USE_MOCK_DATA = false; // Conectado al backend real

export class GetCategoryDetailUseCase {
  private httpClient: HttpClientService;

  constructor(apiUrl?: string) {
    const baseUrl = apiUrl || API_CONFIG.baseUrl;
    this.httpClient = new HttpClientService({ baseUrl });
  }

  async execute(categoryId: string): Promise<CategoryDetailDto> {
    // Modo mock para desarrollo (solo si USE_MOCK_DATA = true)
    if (USE_MOCK_DATA) {
      const { simulateNetworkDelay } = await import("@/shared/Utils/mockData");
      await simulateNetworkDelay(500);
      
      // Mock data
      return {
        category: {
          id: categoryId,
          name: "Carpintería",
          description: "Trabajo en madera",
          workers_count: 5,
          services_count: 8,
        },
        workers: [],
        services: [],
      };
    }

    try {
      // Llamada al backend real: GET /categories/:id
      const endpoint = API_CONFIG.endpoints.serviceCategories.getById(categoryId);
      console.log("Fetching category detail from:", endpoint);
      const backendResponse = await this.httpClient.get<{
        status?: string;
        category?: {
          id: string;
          name: string;
          description?: string;
          icon?: string;
          workers_count?: number;
          services_count?: number;
        };
        workers?: Array<{
          worker_id: string;
          first_name: string;
          last_name: string;
          phone?: string;
          location?: string;
          avatar_url?: string;
          years_experience?: number;
          verification_status: string;
          is_active: boolean;
          services_count: number;
          min_price?: number;
          max_price?: number;
        }>;
        services?: Array<{
          id: string;
          title: string;
          description: string;
          base_price?: number;
          is_available: boolean;
          worker_id: string;
          worker_name: string;
        }>;
      }>(endpoint);

      console.log("Backend response:", backendResponse);
      console.log("Backend response keys:", Object.keys(backendResponse));

      // El backend devuelve: { status: "success", category: {...}, workers: [...], services: [...] }
      const category = backendResponse.category || {
        id: categoryId,
        name: "Categoría",
        description: "",
        workers_count: 0,
        services_count: 0,
      };

      // Validar que category tenga al menos id y name
      if (!category.id || !category.name) {
        console.error("Category data incomplete:", category);
        throw new Error("La categoría recibida no tiene la estructura esperada");
      }

      const result: CategoryDetailDto = {
        category: {
          id: category.id || categoryId,
          name: category.name || "Categoría sin nombre",
          description: category.description || "",
          icon: category.icon,
          workers_count: category.workers_count ?? (backendResponse.workers?.length || 0),
          services_count: category.services_count ?? (backendResponse.services?.length || 0),
        },
        workers: (backendResponse.workers || []).map((worker: any) => ({
          worker_id: worker.worker_id || "",
          first_name: worker.first_name || "Sin nombre",
          last_name: worker.last_name || "",
          phone: worker.phone,
          location: worker.location,
          avatar_url: worker.avatar_url,
          years_experience: worker.years_experience ?? 0,
          verification_status: worker.verification_status || "pending",
          is_active: worker.is_active ?? true,
          services_count: worker.services_count || 0,
          min_price: worker.min_price != null ? Number(worker.min_price) : undefined,
          max_price: worker.max_price != null ? Number(worker.max_price) : undefined,
        })),
        services: (backendResponse.services || []).map((service: any) => ({
          id: service.id || "",
          title: service.title || "Servicio sin título",
          description: service.description || "",
          base_price: service.base_price != null ? Number(service.base_price) : undefined,
          is_available: service.is_available ?? true,
          worker_id: service.worker_id || "",
          worker_name: service.worker_name || "Trabajador desconocido",
        })),
      };

      console.log("Processed result:", result);
      console.log("Result validation:", {
        hasCategory: !!result.category,
        categoryName: result.category.name,
        workersLength: result.workers.length,
        servicesLength: result.services.length,
      });
      return result;
    } catch (error) {
      // Manejar errores específicos
      if (error instanceof Error) {
        throw error;
      }
      throw new Error('Error al cargar el detalle de la categoría');
    }
  }
}
