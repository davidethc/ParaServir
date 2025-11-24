import { useState } from "react";
import { useAppDispatch } from "@/shared/infrastructure/store/hooks";
import { setUser } from "../../store/userSlice";
import { userApiService, type LoginRequest } from "../services/userApiService";
import { useNavigate } from "react-router-dom";

interface UseUserLoginReturn {
  login: (data: LoginRequest) => Promise<void>;
  isLoading: boolean;
  error: string | null;
}

export function useUserLogin(): UseUserLoginReturn {
  const dispatch = useAppDispatch();
  const navigate = useNavigate();
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const login = async (data: LoginRequest) => {
    setIsLoading(true);
    setError(null);

    try {
      const response = await userApiService.login(data);
      
      // Guardar usuario en Redux
      dispatch(setUser({
        id: response.user.id,
        name: response.user.name,
        email: response.user.email,
        role: response.user.role,
        isVerified: response.user.isVerified,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      }));
      
      // Redirigir después del login exitoso
      navigate("/dashboard");
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : "Error al iniciar sesión";
      setError(errorMessage);
    } finally {
      setIsLoading(false);
    }
  };

  return {
    login,
    isLoading,
    error,
  };
}

