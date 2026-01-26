import { HttpClientService } from "@/shared/services/http-client.service";
import type { AvailabilityResponse, UpdateAvailabilityRequest, AvailabilityDayDto } from "../../../application/dto/availability.dto";
import { API_CONFIG } from "../api.config";

export class AvailabilityController {
  private httpClient: HttpClientService;
  private apiUrl: string;

  constructor(apiUrl?: string) {
    this.apiUrl = apiUrl || API_CONFIG.baseUrl;
    this.httpClient = new HttpClientService({ baseUrl: this.apiUrl });
  }

  async getByWorkerId(workerId: string): Promise<AvailabilityResponse> {
    const response = await this.httpClient.get<AvailabilityResponse>(
      API_CONFIG.endpoints.availability.byWorkerId(workerId)
    );

    return response;
  }

  async update(availability: AvailabilityDayDto[], token: string): Promise<AvailabilityResponse> {
    const response = await this.httpClient.put<AvailabilityResponse>(
      API_CONFIG.endpoints.availability.base,
      { availability },
      { Authorization: `Bearer ${token}` }
    );

    return response;
  }
}
