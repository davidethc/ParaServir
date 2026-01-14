import { HttpClientService } from "@/shared/services/http-client.service";
import type { NotificationDto, NotificationsResponse } from "../../application/dto/notification.dto";
import { NOTIFICATION_API_CONFIG } from "../api.config";

export class NotificationController {
  private httpClient: HttpClientService;
  private apiUrl: string;

  constructor(apiUrl?: string) {
    this.apiUrl = apiUrl || NOTIFICATION_API_CONFIG.baseUrl;
    this.httpClient = new HttpClientService({ baseUrl: this.apiUrl });
  }

  async getAll(token: string, unreadOnly: boolean = false, limit: number = 50): Promise<NotificationsResponse> {
    const params = new URLSearchParams();
    if (unreadOnly) params.append('unread_only', 'true');
    params.append('limit', limit.toString());

    const response = await this.httpClient.get<NotificationsResponse>(
      `${NOTIFICATION_API_CONFIG.endpoints.notifications.base}?${params.toString()}`,
      { Authorization: `Bearer ${token}` }
    );

    return response;
  }

  async markAsRead(id: string, token: string): Promise<void> {
    await this.httpClient.put(
      NOTIFICATION_API_CONFIG.endpoints.notifications.markRead(id),
      {},
      { Authorization: `Bearer ${token}` }
    );
  }

  async markAllAsRead(token: string): Promise<void> {
    await this.httpClient.put(
      NOTIFICATION_API_CONFIG.endpoints.notifications.markAllRead,
      {},
      { Authorization: `Bearer ${token}` }
    );
  }

  async delete(id: string, token: string): Promise<void> {
    await this.httpClient.delete(
      NOTIFICATION_API_CONFIG.endpoints.notifications.byId(id),
      { Authorization: `Bearer ${token}` }
    );
  }
}
