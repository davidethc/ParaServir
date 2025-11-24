import { useState } from "react";
import { useAppDispatch } from "@/shared/infrastructure/store/hooks";
import { setUser } from "../../store/userSlice";
import { userApiService, type CreateUserRequest } from "../services/userApiService";

interface UseUserRegisterReturn {
  register: (data: CreateUserRequest) => Promise<{ userId: string; role: string } | null>;
  isLoading: boolean;
  error: string | null;
  success: boolean;
}

export function useUserRegister(): UseUserRegisterReturn {
  const dispatch = useAppDispatch();
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  const register = async (data: CreateUserRequest): Promise<{ userId: string; role: string } | null> => {
    setIsLoading(true);
    setError(null);
    setSuccess(false);

    try {
      await userApiService.createUser(data);
      
      // Guardar usuario en Redux para que esté disponible después del registro
      const now = new Date().toISOString();
      dispatch(setUser({
        id: data.id,
        name: data.name,
        email: data.email,
        role: data.role,
        isVerified: false,
        createdAt: now,
        updatedAt: now,
      }));
      
      setSuccess(true);
      return { userId: data.id, role: data.role };
    } catch (err) {
      setError(err instanceof Error ? err.message : "Error al registrar usuario");
      setSuccess(false);
      return null;
    } finally {
      setIsLoading(false);
    }
  };

  return {
    register,
    isLoading,
    error,
    success,
  };
}

