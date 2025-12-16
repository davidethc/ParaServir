import axios, { type AxiosInstance } from 'axios';

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
  private axiosInstance: AxiosInstance;

  constructor(config: HttpClientConfig) {
    this.axiosInstance = axios.create({
      baseURL: config.baseUrl,
      headers: {
        'Content-Type': 'application/json',
        ...config.headers,
      },
    });
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
    const headers = { ...customHeaders };

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
  private handleError(error: unknown): never {
    let errorMessage = 'Error en la petición';
    
    if (axios.isAxiosError(error)) {
      if (error.response) {
        const errorData = error.response.data;
        errorMessage = errorData.message || errorData.error || errorMessage;
      } else if (error.request) {
        errorMessage = 'No se recibió respuesta del servidor';
      } else {
        errorMessage = error.message;
      }
    } else if (error instanceof Error) {
      errorMessage = error.message;
    }

    throw new Error(errorMessage);
  }

  /**
   * Realiza una petición GET
   */
  async get<T>(endpoint: string, headers?: Record<string, string>): Promise<T> {
    try {
      const response = await this.axiosInstance.get<T>(endpoint, {
        headers: this.buildHeaders(headers),
      });
      return response.data;
    } catch (error) {
      this.handleError(error);
    }
  }

  /**
   * Realiza una petición POST
   */
  async post<T>(endpoint: string, data?: unknown, headers?: Record<string, string>): Promise<T> {
    try {
      const response = await this.axiosInstance.post<T>(endpoint, data, {
        headers: this.buildHeaders(headers),
      });
      return response.data;
    } catch (error) {
      this.handleError(error);
    }
  }

  /**
   * Realiza una petición PUT
   */
  async put<T>(endpoint: string, data?: unknown, headers?: Record<string, string>): Promise<T> {
    try {
      const response = await this.axiosInstance.put<T>(endpoint, data, {
        headers: this.buildHeaders(headers),
      });
      return response.data;
    } catch (error) {
      this.handleError(error);
    }
  }

  /**
   * Realiza una petición DELETE
   */
  async delete<T>(endpoint: string, headers?: Record<string, string>): Promise<T> {
    try {
      const response = await this.axiosInstance.delete<T>(endpoint, {
        headers: this.buildHeaders(headers),
      });
      return response.data;
    } catch (error) {
      this.handleError(error);
    }
  }
}
