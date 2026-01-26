import { useState, useEffect, useCallback, useMemo } from "react";
import { FavoriteController } from "@/modules/Favorites/infra/http/controllers/favorite.controller";
import type { FavoriteDto } from "@/modules/Favorites/application/dto/favorite.dto";
import { useAuth } from "./useAuth";

export function useFavorites() {
  const { getToken, isAuthenticated } = useAuth();
  const [favorites, setFavorites] = useState<FavoriteDto[]>([]);
  const [favoriteIds, setFavoriteIds] = useState<Set<string>>(new Set());
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const controller = useMemo(() => new FavoriteController(), []);

  const loadFavorites = useCallback(async () => {
    if (!isAuthenticated) {
      setFavorites([]);
      setFavoriteIds(new Set());
      return;
    }

    const token = getToken();
    if (!token) return;

    setLoading(true);
    setError(null);

    try {
      const response = await controller.getAll(token);
      setFavorites(response.favorites || []);
      setFavoriteIds(new Set(response.favorites?.map(f => f.worker_id) || []));
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : "Error al cargar favoritos";
      setError(errorMessage);
      console.error("Error loading favorites:", err);
    } finally {
      setLoading(false);
    }
  }, [controller, getToken, isAuthenticated]);

  const addFavorite = useCallback(async (workerId: string) => {
    const token = getToken();
    if (!token) {
      throw new Error("No autenticado");
    }

    try {
      await controller.add(workerId, token);
      // Actualizar estado local
      const isFavoriteResponse = await controller.isFavorite(workerId, token);
      if (isFavoriteResponse.is_favorite) {
        setFavoriteIds(prev => new Set([...prev, workerId]));
      }
      // Recargar favoritos para obtener datos completos
      await loadFavorites();
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : "Error al agregar favorito";
      throw new Error(errorMessage);
    }
  }, [controller, getToken, loadFavorites]);

  const removeFavorite = useCallback(async (workerId: string) => {
    const token = getToken();
    if (!token) {
      throw new Error("No autenticado");
    }

    try {
      await controller.remove(workerId, token);
      // Actualizar estado local
      setFavoriteIds(prev => {
        const newSet = new Set(prev);
        newSet.delete(workerId);
        return newSet;
      });
      setFavorites(prev => prev.filter(f => f.worker_id !== workerId));
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : "Error al eliminar favorito";
      throw new Error(errorMessage);
    }
  }, [controller, getToken]);

  const toggleFavorite = useCallback(async (workerId: string) => {
    const isCurrentlyFavorite = favoriteIds.has(workerId);
    if (isCurrentlyFavorite) {
      await removeFavorite(workerId);
    } else {
      await addFavorite(workerId);
    }
  }, [favoriteIds, addFavorite, removeFavorite]);

  const isFavorite = useCallback((workerId: string): boolean => {
    return favoriteIds.has(workerId);
  }, [favoriteIds]);

  const checkIsFavorite = useCallback(async (workerId: string): Promise<boolean> => {
    const token = getToken();
    if (!token) return false;

    try {
      const response = await controller.isFavorite(workerId, token);
      return response.is_favorite;
    } catch {
      return false;
    }
  }, [controller, getToken]);

  // Cargar favoritos al montar
  useEffect(() => {
    void loadFavorites();
  }, [loadFavorites]);

  return {
    favorites,
    favoriteIds,
    loading,
    error,
    addFavorite,
    removeFavorite,
    toggleFavorite,
    isFavorite,
    checkIsFavorite,
    reloadFavorites: loadFavorites,
  };
}
