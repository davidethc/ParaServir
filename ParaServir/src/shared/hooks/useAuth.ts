import { useState, useCallback } from 'react';
import { authService } from '../../infrastructure/http/services/AuthService';
import type { RegisterUserDTO } from '../../application/dto/RegisterUserDTO';
import type { LoginDTO } from '../../application/dto/LoginDTO';
import type { AuthResponseDTO } from '../../application/dto/AuthResponseDTO';

export function useAuth() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [user, setUser] = useState<{
    userId: string | null;
    role: string | null;
    token: string | null;
  }>({
    userId: authService.getUserId(),
    role: authService.getRole(),
    token: authService.getToken(),
  });

  const register = useCallback(async (dto: RegisterUserDTO): Promise<AuthResponseDTO | null> => {
    setLoading(true);
    setError(null);
    try {
      const result = await authService.register(dto);
      setUser({
        userId: result.userId,
        role: result.role,
        token: result.token,
      });
      return result;
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Error al registrar usuario';
      setError(message);
      return null;
    } finally {
      setLoading(false);
    }
  }, []);

  const login = useCallback(async (dto: LoginDTO): Promise<AuthResponseDTO | null> => {
    setLoading(true);
    setError(null);
    try {
      const result = await authService.login(dto);
      setUser({
        userId: result.userId,
        role: result.role,
        token: result.token,
      });
      return result;
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Error al iniciar sesión';
      setError(message);
      return null;
    } finally {
      setLoading(false);
    }
  }, []);

  const logout = useCallback(async (): Promise<void> => {
    setLoading(true);
    setError(null);
    try {
      await authService.logout();
      setUser({
        userId: null,
        role: null,
        token: null,
      });
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Error al cerrar sesión';
      setError(message);
    } finally {
      setLoading(false);
    }
  }, []);

  const isAuthenticated = useCallback((): boolean => {
    return authService.isAuthenticated();
  }, []);

  return {
    user,
    loading,
    error,
    register,
    login,
    logout,
    isAuthenticated,
  };
}

