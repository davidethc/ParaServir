import { HttpClientService } from "@/shared/services/http-client.service";
import type { FavoriteDto, FavoritesResponse, IsFavoriteResponse, FavoriteActionResponse } from "../../../application/dto/favorite.dto";
import { API_CONFIG } from "../api.config";

export class FavoriteController {
  private httpClient: HttpClientService;
  private apiUrl: string;

  constructor(apiUrl?: string) {
    this.apiUrl = apiUrl || API_CONFIG.baseUrl;
    this.httpClient = new HttpClientService({ baseUrl: this.apiUrl });
  }

  async getAll(token: string): Promise<FavoritesResponse> {
    const response = await this.httpClient.get<FavoritesResponse>(
      API_CONFIG.endpoints.favorites.base,
      { Authorization: `Bearer ${token}` }
    );

    return response;
  }

  async add(workerId: string, token: string): Promise<FavoriteActionResponse> {
    const response = await this.httpClient.post<FavoriteActionResponse>(
      API_CONFIG.endpoints.favorites.base,
      { worker_id: workerId },
      { Authorization: `Bearer ${token}` }
    );

    return response;
  }

  async remove(workerId: string, token: string): Promise<FavoriteActionResponse> {
    const response = await this.httpClient.delete<FavoriteActionResponse>(
      API_CONFIG.endpoints.favorites.byWorkerId(workerId),
      { Authorization: `Bearer ${token}` }
    );

    return response;
  }

  async isFavorite(workerId: string, token: string): Promise<IsFavoriteResponse> {
    const response = await this.httpClient.get<IsFavoriteResponse>(
      API_CONFIG.endpoints.favorites.byWorkerId(workerId),
      { Authorization: `Bearer ${token}` }
    );

    return response;
  }
}
