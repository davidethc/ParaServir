import { API_CONFIG } from "../../infra/http/api.config";
import { HttpClientService } from "@/shared/services/http-client.service";
import type { StartConversationDto } from "../dto/message.dto";
import type { MessageDto } from "../dto/message.dto";
import { simulateNetworkDelay } from "@/shared/Utils/mockData";

const USE_MOCK_DATA = false;

export class StartConversationUseCase {
  private apiUrl: string;

  constructor(apiUrl?: string) {
    this.apiUrl = apiUrl || API_CONFIG.baseUrl;
  }

  async execute(dto: StartConversationDto, token: string): Promise<MessageDto> {
    if (!token) throw new Error("Token de autenticación requerido");

    if (USE_MOCK_DATA) {
      await simulateNetworkDelay(600);
      return {
        id: `msg-${Date.now()}`,
        content: dto.content,
        created_at: new Date().toISOString(),
        sender_id: "mock-user-id",
        sender_name: "Mock User",
        sender_avatar: null,
        is_own: true,
      };
    }

    const httpClient = new HttpClientService({ baseUrl: this.apiUrl });
    const response = await httpClient.post<{ status: string; message: MessageDto }>(
      API_CONFIG.endpoints.chat.start,
      dto,
      {
        Authorization: `Bearer ${token}`,
      }
    );
    return response.message;
  }
}

