import { useState, useCallback } from "react";
import { HttpClientService } from "@/shared/services/http-client.service";
import { useAuth } from "./useAuth";
import { API_CONFIG } from "@/modules/Reviews/infra/http/api.config";

interface LocationUpdateParams {
  address?: string;
  latitude?: number;
  longitude?: number;
}

interface LocationResponse {
  status: string;
  location: {
    address: string | null;
    latitude: number;
    longitude: number;
  };
}

export function useGeolocation() {
  const { getToken } = useAuth();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const updateLocation = useCallback(async (params: LocationUpdateParams) => {
    setLoading(true);
    setError(null);

    try {
      const token = getToken();
      if (!token) {
        throw new Error("Sesión expirada");
      }

      const httpClient = new HttpClientService({ baseUrl: API_CONFIG.baseUrl });
      const response = await httpClient.put<LocationResponse>(
        "/workers/location",
        params,
        { Authorization: `Bearer ${token}` }
      );

      return response.location;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : "Error al actualizar ubicación";
      setError(errorMessage);
      throw err;
    } finally {
      setLoading(false);
    }
  }, [getToken]);

  const getCurrentLocation = useCallback((): Promise<{ latitude: number; longitude: number }> => {
    return new Promise((resolve, reject) => {
      if (!navigator.geolocation) {
        reject(new Error("Tu navegador no soporta geolocalización"));
        return;
      }

      navigator.geolocation.getCurrentPosition(
        (position) => {
          resolve({
            latitude: position.coords.latitude,
            longitude: position.coords.longitude,
          });
        },
        (err) => {
          // Manejar errores de manera silenciosa para errores esperados
          // Código 1: PERMISSION_DENIED
          // Código 2: POSITION_UNAVAILABLE
          // Código 3: TIMEOUT
          const errorMessage = err.code === 1 
            ? "Permisos de ubicación denegados"
            : err.code === 3
            ? "Tiempo de espera agotado"
            : "No se pudo obtener la ubicación";
          
          reject(new Error(errorMessage));
        },
        {
          timeout: 10000,
          enableHighAccuracy: true,
          maximumAge: 0
        }
      );
    });
  }, []);

  return {
    updateLocation,
    getCurrentLocation,
    loading,
    error,
  };
}
