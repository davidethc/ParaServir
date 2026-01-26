import { useState, useEffect, useCallback, useMemo } from "react";
import { HttpClientService } from "@/shared/services/http-client.service";
import { useAuth } from "./useAuth";

export interface SearchHistoryItem {
  id: string;
  query: string | null;
  filters: Record<string, any> | null;
  created_at: string;
}

interface SearchHistoryResponse {
  status: string;
  searches: SearchHistoryItem[];
  count: number;
}

const API_CONFIG = {
  baseUrl: import.meta.env.VITE_API_URL || 'http://localhost:3900',
  endpoints: {
    base: '/search-history',
  },
};

export function useSearchHistory() {
  const { getToken, isAuthenticated } = useAuth();
  const [searches, setSearches] = useState<SearchHistoryItem[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const httpClient = useMemo(() => new HttpClientService({ baseUrl: API_CONFIG.baseUrl }), []);

  const loadHistory = useCallback(async (limit: number = 10) => {
    if (!isAuthenticated) {
      setSearches([]);
      return;
    }

    const token = getToken();
    if (!token) return;

    setLoading(true);
    setError(null);

    try {
      const response = await httpClient.get<SearchHistoryResponse>(
        `${API_CONFIG.endpoints.base}?limit=${limit}`,
        { Authorization: `Bearer ${token}` }
      );
      setSearches(response.searches || []);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : "Error al cargar historial";
      setError(errorMessage);
      console.error("Error loading search history:", err);
    } finally {
      setLoading(false);
    }
  }, [httpClient, getToken, isAuthenticated]);

  const saveSearch = useCallback(async (query?: string, filters?: Record<string, any>) => {
    const token = getToken();
    if (!token || !isAuthenticated) {
      return; // No guardar si no está autenticado
    }

    try {
      await httpClient.post(
        API_CONFIG.endpoints.base,
        { query, filters },
        { Authorization: `Bearer ${token}` }
      );
      // Recargar historial después de guardar
      await loadHistory();
    } catch (err) {
      // Silenciosamente falla - no es crítico
      console.error("Error saving search history:", err);
    }
  }, [httpClient, getToken, isAuthenticated, loadHistory]);

  const deleteSearch = useCallback(async (id: string) => {
    const token = getToken();
    if (!token) {
      throw new Error("No autenticado");
    }

    try {
      await httpClient.delete(
        `${API_CONFIG.endpoints.base}/${id}`,
        { Authorization: `Bearer ${token}` }
      );
      setSearches(prev => prev.filter(s => s.id !== id));
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : "Error al eliminar búsqueda";
      throw new Error(errorMessage);
    }
  }, [httpClient, getToken]);

  const clearHistory = useCallback(async () => {
    const token = getToken();
    if (!token) {
      throw new Error("No autenticado");
    }

    try {
      await httpClient.delete(
        API_CONFIG.endpoints.base,
        { Authorization: `Bearer ${token}` }
      );
      setSearches([]);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : "Error al limpiar historial";
      throw new Error(errorMessage);
    }
  }, [httpClient, getToken]);

  // Cargar historial al montar
  useEffect(() => {
    void loadHistory();
  }, [loadHistory]);

  return {
    searches,
    loading,
    error,
    saveSearch,
    deleteSearch,
    clearHistory,
    reloadHistory: loadHistory,
  };
}
