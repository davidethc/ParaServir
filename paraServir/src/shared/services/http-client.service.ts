import axios from 'axios';
import type {
  AxiosInstance,
  AxiosRequestConfig,
} from 'axios';

/**
 * Servicio HTTP centralizado
 * - Manejo automático de token
 * - Manejo centralizado de errores
 * - Tipado fuerte
 */

interface ApiErrorResponse {
  message?: string;
  error?: string;
}

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
   * Obtiene el token desde localStorage
   */
  private getAuthToken(): string | null {
    return localStorage.getItem('token');
  }

  /**
   * Construye headers con Authorization si existe
   */
  private buildHeaders(
    customHeaders?: Record<string, string>
  ): Record<string, string> {
    const headers: Record<string, string> = {
      ...customHeaders,
    };

    if (!headers.Authorization) {
      const token = this.getAuthToken();
      if (token) {
        headers.Authorization = `Bearer ${token}`;
      }
    }

    return headers;
  }

  /**
   * Manejo centralizado de errores Axios
   */
  private handleError(error: unknown): never {
    console.error(error);

    let errorMessage = 'Error en la petición';

    if (axios.isAxiosError<ApiErrorResponse>(error)) {
      const status = error.response?.status;
      const data = error.response?.data;

      if (status === 401) {
        errorMessage =
          data?.message ||
          'Token inválido o sesión expirada. Inicia sesión nuevamente.';
      } else if (status === 403) {
        errorMessage =
          data?.message || 'No tienes permisos para realizar esta acción.';
      } else if (status === 404) {
        errorMessage = data?.message || 'Recurso no encontrado.';
      } else if (status === 400) {
        errorMessage =
          data?.message || 'Datos inválidos. Verifica la información enviada.';
      } else {
        errorMessage =
          data?.message ||
          error.message ||
          'Error inesperado en el servidor';
      }
    }

    throw new Error(errorMessage);
  }

  /**
   * GET
   */
  async get<T>(
    endpoint: string,
    headers?: Record<string, string>,
    silent404 = false
  ): Promise<T | null> {
    try {
      const config: AxiosRequestConfig = {
        headers: this.buildHeaders(headers),
      };

      const response = await this.axiosInstance.get<T>(endpoint, config);
      return response.data;
    } catch (error) {
      if (
        silent404 &&
        axios.isAxiosError(error) &&
        error.response?.status === 404
      ) {
        return null;
      }
      this.handleError(error);
    }
  }

  /**
   * POST
   */
  async post<T>(
    endpoint: string,
    data?: unknown,
    headers?: Record<string, string>
  ): Promise<T> {
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
   * PUT
   */
  async put<T>(
    endpoint: string,
    data?: unknown,
    headers?: Record<string, string>
  ): Promise<T> {
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
   * DELETE
   */
  async delete<T>(
    endpoint: string,
    headers?: Record<string, string>
  ): Promise<T> {
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
