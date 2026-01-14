import { HttpClientService } from "@/shared/services/http-client.service";
import { API_CONFIG } from "../../infra/http/api.config";

export interface GoogleAuthResponse {
  status: string;
  user: {
    id: string;
    email: string;
    role: string;
  };
  token: string;
}

export class GoogleAuthService {
  private httpClient: HttpClientService;
  private apiUrl: string;

  constructor(apiUrl?: string) {
    this.apiUrl = apiUrl || API_CONFIG.baseUrl;
    this.httpClient = new HttpClientService({ baseUrl: this.apiUrl });
  }

  async authenticate(googleToken: string, email: string, name: string, picture?: string): Promise<GoogleAuthResponse> {
    const response = await this.httpClient.post<GoogleAuthResponse>(
      '/auth/google',
      {
        email,
        name,
        google_id: googleToken,
        picture
      }
    );

    return response;
  }
}
