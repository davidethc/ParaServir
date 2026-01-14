import { useState, useEffect } from 'react';
import { GetMeUseCase } from '@/modules/Users/application/use-cases/get-me.use-case';
import type { UserDto } from '@/modules/Users/application/dto/user.dto';
import { useAuth } from './useAuth';

interface UseMeReturn {
  user: UserDto | null;
  loading: boolean;
  error: string | null;
  refetch: () => Promise<void>;
}

export function useMe(): UseMeReturn {
  const [user, setUser] = useState<UserDto | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const { getToken } = useAuth();
  const useCase = new GetMeUseCase();

  const fetchUser = async () => {
    try {
      setLoading(true);
      setError(null);
      const token = getToken();
      
      if (!token) {
        setError('No hay token de autenticación');
        setLoading(false);
        return;
      }

      const userData = await useCase.execute(token);
      setUser(userData);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Error al obtener perfil';
      setError(errorMessage);
      setUser(null);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    void fetchUser();
  }, []);

  return {
    user,
    loading,
    error,
    refetch: fetchUser,
  };
}

