import { API_CONFIG } from "../../infra/http/api.config";
import { HttpClientService } from "@/shared/services/http-client.service";
import type { ConversationsResponse } from "../dto/conversation.dto";
import { simulateNetworkDelay } from "@/shared/Utils/mockData";

const USE_MOCK_DATA = false;

export class GetConversationsUseCase {
  private apiUrl: string;

  constructor(apiUrl?: string) {
    this.apiUrl = apiUrl || API_CONFIG.baseUrl;
  }

  async execute(token: string): Promise<ConversationsResponse> {
    if (!token) throw new Error("Token de autenticación requerido");

    if (USE_MOCK_DATA) {
      await simulateNetworkDelay(400);
      return {
        status: "success",
        conversations: [],
      };
    }

    const httpClient = new HttpClientService({ baseUrl: this.apiUrl });
    const data = await httpClient.get<ConversationsResponse>(API_CONFIG.endpoints.chat.conversations, {
      Authorization: `Bearer ${token}`,
    });
    return data;
  }
}

