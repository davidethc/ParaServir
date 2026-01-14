import { API_CONFIG } from "../../infra/http/api.config";
import { HttpClientService } from "@/shared/services/http-client.service";
import type { MessagesResponse } from "../dto/message.dto";
import { simulateNetworkDelay } from "@/shared/Utils/mockData";

const USE_MOCK_DATA = false;

export class GetMessagesUseCase {
  private apiUrl: string;

  constructor(apiUrl?: string) {
    this.apiUrl = apiUrl || API_CONFIG.baseUrl;
  }

  async execute(requestId: string, token: string): Promise<MessagesResponse> {
    if (!token) throw new Error("Token de autenticación requerido");
    if (!requestId) throw new Error("requestId es requerido");

    if (USE_MOCK_DATA) {
      await simulateNetworkDelay(400);
      return {
        status: "success",
        messages: [],
      };
    }

    const httpClient = new HttpClientService({ baseUrl: this.apiUrl });
    const data = await httpClient.get<MessagesResponse>(API_CONFIG.endpoints.chat.messages(requestId), {
      Authorization: `Bearer ${token}`,
    });
    return data;
  }
}

