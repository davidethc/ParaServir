/**
 * Servicio HTTP centralizado para todas las peticiones al backend
 * - Agrega token automáticamente
 * - Maneja errores de forma centralizada
 * - Transforma respuestas
 */

export interface HttpClientConfig {
  baseUrl: string;
  headers?: Record<string, string>;
}

export class HttpClientService {
  private baseUrl: string;
  private defaultHeaders: Record<string, string>;

  constructor(config: HttpClientConfig) {
    this.baseUrl = config.baseUrl;
    this.defaultHeaders = {
      'Content-Type': 'application/json',
      ...config.headers,
    };
  }

  /**
   * Obtiene el token de autenticación desde localStorage
   * Nota: Usamos localStorage directamente aquí para evitar dependencias circulares
   * El AuthStorageService se usa en otros lugares donde no hay riesgo de circularidad
   */
  private getAuthToken(): string | null {
    return localStorage.getItem('token');
  }

  /**
   * Construye los headers con el token si existe
   * Si se pasa Authorization en customHeaders, tiene prioridad sobre el token de localStorage
   */
  private buildHeaders(customHeaders?: Record<string, string>): Record<string, string> {
    const headers = { ...this.defaultHeaders, ...customHeaders };

    // Si no se pasó Authorization en customHeaders, usar el token de localStorage
    if (!headers['Authorization']) {
      const token = this.getAuthToken();
      if (token) {
        headers['Authorization'] = `Bearer ${token}`;
      }
    }

    return headers;
  }

  /**
   * Maneja errores de respuesta
   */
  private async handleError(response: Response): Promise<never> {
    let errorMessage = 'Error en la petición';
    
    try {
      const errorData = await response.json();
      errorMessage = errorData.message || errorData.error || errorMessage;
    } catch {
      // Si no se puede parsear JSON, usar el mensaje por defecto
      errorMessage = `Error ${response.status}: ${response.statusText}`;
    }

    throw new Error(errorMessage);
  }

  /**
   * Realiza una petición GET
   */
  async get<T>(endpoint: string, headers?: Record<string, string>): Promise<T> {
    const url = `${this.baseUrl}${endpoint}`;
    const response = await fetch(url, {
      method: 'GET',
      headers: this.buildHeaders(headers),
    });

    if (!response.ok) {
      await this.handleError(response);
    }

    return response.json();
  }

  /**
   * Realiza una petición POST
   */
  async post<T>(endpoint: string, data?: unknown, headers?: Record<string, string>): Promise<T> {
    const url = `${this.baseUrl}${endpoint}`;
    const response = await fetch(url, {
      method: 'POST',
      headers: this.buildHeaders(headers),
      body: data ? JSON.stringify(data) : undefined,
    });

    if (!response.ok) {
      await this.handleError(response);
    }

    return response.json();
  }

  /**
   * Realiza una petición PUT
   */
  async put<T>(endpoint: string, data?: unknown, headers?: Record<string, string>): Promise<T> {
    const url = `${this.baseUrl}${endpoint}`;
    const response = await fetch(url, {
      method: 'PUT',
      headers: this.buildHeaders(headers),
      body: data ? JSON.stringify(data) : undefined,
    });

    if (!response.ok) {
      await this.handleError(response);
    }

    return response.json();
  }

  /**
   * Realiza una petición DELETE
   */
  async delete<T>(endpoint: string, headers?: Record<string, string>): Promise<T> {
    const url = `${this.baseUrl}${endpoint}`;
    const response = await fetch(url, {
      method: 'DELETE',
      headers: this.buildHeaders(headers),
    });

    if (!response.ok) {
      await this.handleError(response);
    }

    return response.json();
  }
}

