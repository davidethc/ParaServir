import { useCallback } from "react";
import { useDispatch, useSelector } from "react-redux";
import type { RootState } from "@/Store";
import { login, logout, restoreAuth } from "@/Store/slices/authSlice";
import { AuthStorageService } from "@/shared/services/auth-storage.service";

/**
 * Hook personalizado unificado para manejo de autenticación
 * 
 * Combina Redux + localStorage de forma transparente
 * Elimina la necesidad de acceder a múltiples fuentes
 * 
 * @returns Objeto con estado de autenticación y funciones de login/logout
 */
export function useAuth() {
  const dispatch = useDispatch();
  const isAuthenticated = useSelector(
    (state: RootState) => state.auth.isAuthenticated
  );
  const user = useSelector((state: RootState) => state.auth.user);

  /**
   * Función de login que actualiza Redux y localStorage
   * Memoizada para evitar recreaciones innecesarias
   */
  const handleLogin = useCallback((userData: {
    id: string;
    email: string;
    role: string;
    token: string;
  }) => {
    dispatch(
      login({
        id: userData.id,
        email: userData.email,
        role: userData.role,
        token: userData.token,
      })
    );
  }, [dispatch]);

  /**
   * Función de logout que limpia Redux y localStorage
   * Memoizada para evitar recreaciones innecesarias
   */
  const handleLogout = useCallback(() => {
    dispatch(logout());
  }, [dispatch]);

  /**
   * Restaurar autenticación desde localStorage (sin guardar de nuevo)
   * Útil para inicialización
   * Memoizada con useCallback para evitar recreaciones innecesarias
   */
  const restoreFromStorage = useCallback(() => {
    const authData = AuthStorageService.getAuthData();
    if (authData) {
      dispatch(
        restoreAuth({
          id: authData.userId,
          email: authData.userEmail,
          role: authData.userRole,
        })
      );
    }
  }, [dispatch]);

  /**
   * Obtener token de forma segura
   * Memoizada para evitar recreaciones innecesarias
   */
  const getToken = useCallback((): string | null => {
    return AuthStorageService.getToken();
  }, []);

  /**
   * Obtener userId de forma segura
   * Memoizada para evitar recreaciones innecesarias
   */
  const getUserId = useCallback((): string | null => {
    return user?.id || AuthStorageService.getUserId();
  }, [user?.id]);

  return {
    isAuthenticated,
    user,
    login: handleLogin,
    logout: handleLogout,
    restoreFromStorage,
    getToken,
    getUserId,
  };
}
