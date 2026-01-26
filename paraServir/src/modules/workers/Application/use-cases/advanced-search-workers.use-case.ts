import { API_CONFIG } from "../../infra/http/api.config";
import { HttpClientService } from "@/shared/services/http-client.service";
import type { WorkerProfileDto } from "../dto/worker-profile.dto";
import type { AdvancedSearchFiltersState } from "../../presentation/components/AdvancedSearchFilters";

export class AdvancedSearchWorkersUseCase {
  private apiUrl: string;

  constructor(apiUrl?: string) {
    this.apiUrl = apiUrl || API_CONFIG.baseUrl;
  }

  async execute(
    filters: AdvancedSearchFiltersState,
    token?: string
  ): Promise<WorkerProfileDto[]> {
    // Usar el endpoint público /search que acepta todos los filtros
    const httpClient = new HttpClientService({ baseUrl: this.apiUrl });
    const params = new URLSearchParams();

    // Ubicación (puede ser texto o coordenadas)
    if (filters.location) {
      params.set("location", filters.location);
    }
    if (filters.latitude && filters.longitude) {
      params.set("latitude", filters.latitude.toString());
      params.set("longitude", filters.longitude.toString());
    }
    if (filters.radius !== undefined && filters.radius !== null) {
      params.set("radius", filters.radius.toString());
    }

    // Categoría
    if (filters.categoryId && filters.categoryId !== "all") {
      params.set("category_id", filters.categoryId);
    }

    // Búsqueda de texto (se busca en nombres, ubicación y servicios)
    if (filters.searchTerm) {
      params.set("search", filters.searchTerm);
    }

    // Precio
    if (filters.minPrice !== null && filters.minPrice !== undefined) {
      params.set("min_price", filters.minPrice.toString());
    }
    if (filters.maxPrice !== null && filters.maxPrice !== undefined) {
      params.set("max_price", filters.maxPrice.toString());
    }

    // Rating
    if (filters.minRating !== null && filters.minRating !== undefined) {
      params.set("min_rating", filters.minRating.toString());
    }

    // Experiencia
    if (filters.minExperience !== null && filters.minExperience !== undefined) {
      params.set("min_experience", filters.minExperience.toString());
    }

    // Ordenamiento
    params.set("sort_by", filters.sortBy || "newest");

    const endpoint = `${API_CONFIG.endpoints.workers.search}?${params.toString()}`;

    try {
      // El endpoint /search es público, no requiere token
      const response = await httpClient.get<{
        status: string;
        workers: WorkerProfileDto[];
        count: number;
      }>(endpoint, {});

      if (response.status === "success" && response.workers) {
        return response.workers;
      }

      return [];
    } catch (error) {
      if (error instanceof Error) {
        throw new Error(`Error al buscar trabajadores: ${error.message}`);
      }
      throw new Error("Error desconocido al buscar trabajadores");
    }
  }

  private async geocodeAddress(address: string): Promise<{
    latitude: number;
    longitude: number;
  } | null> {
    try {
      const response = await fetch(
        `https://nominatim.openstreetmap.org/search?q=${encodeURIComponent(
          address
        )}&format=json&limit=1`,
        {
          headers: {
            "User-Agent": "ParaServir-App/1.0",
          },
        }
      );

      if (!response.ok) {
        return null;
      }

      const data = await response.json();

      if (data && data.length > 0) {
        return {
          latitude: parseFloat(data[0].lat),
          longitude: parseFloat(data[0].lon),
        };
      }

      return null;
    } catch {
      return null;
    }
  }
}