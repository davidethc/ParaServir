import { HttpClientService } from "@/shared/services/http-client.service";
import type { MessageTemplateDto, MessageTemplatesResponse, MessageTemplateActionResponse } from "../../../application/dto/message-template.dto";
import { API_CONFIG } from "../api.config";

export class MessageTemplateController {
  private httpClient: HttpClientService;
  private apiUrl: string;

  constructor(apiUrl?: string) {
    this.apiUrl = apiUrl || API_CONFIG.baseUrl;
    this.httpClient = new HttpClientService({ baseUrl: this.apiUrl });
  }

  async getAll(token: string): Promise<MessageTemplatesResponse> {
    const response = await this.httpClient.get<MessageTemplatesResponse>(
      API_CONFIG.endpoints.messageTemplates.base,
      { Authorization: `Bearer ${token}` }
    );

    return response;
  }

  async create(title: string, content: string, token: string): Promise<MessageTemplateActionResponse> {
    const response = await this.httpClient.post<MessageTemplateActionResponse>(
      API_CONFIG.endpoints.messageTemplates.base,
      { title, content },
      { Authorization: `Bearer ${token}` }
    );

    return response;
  }

  async update(id: string, title?: string, content?: string, token?: string): Promise<MessageTemplateActionResponse> {
    const response = await this.httpClient.put<MessageTemplateActionResponse>(
      API_CONFIG.endpoints.messageTemplates.byId(id),
      { title, content },
      { Authorization: `Bearer ${token}` }
    );

    return response;
  }

  async delete(id: string, token: string): Promise<MessageTemplateActionResponse> {
    const response = await this.httpClient.delete<MessageTemplateActionResponse>(
      API_CONFIG.endpoints.messageTemplates.byId(id),
      { Authorization: `Bearer ${token}` }
    );

    return response;
  }
}
