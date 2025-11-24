import { useState } from "react";
import { userApiService, type CreateUserRequest } from "../services/userApiService";

interface UseUserRegisterReturn {
  register: (data: CreateUserRequest) => Promise<void>;
  isLoading: boolean;
  error: string | null;
  success: boolean;
}

export function useUserRegister(): UseUserRegisterReturn {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  const register = async (data: CreateUserRequest) => {
    setIsLoading(true);
    setError(null);
    setSuccess(false);

    try {
      await userApiService.createUser(data);
      setSuccess(true);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Error al registrar usuario");
      setSuccess(false);
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

