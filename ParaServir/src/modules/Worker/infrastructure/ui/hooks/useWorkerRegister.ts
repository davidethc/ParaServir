import { useState } from "react";
import { workerApiService, type CreateWorkerProfileRequest } from "../services/workerApiService";
import { useNavigate } from "react-router-dom";

interface UseWorkerRegisterReturn {
  register: (data: CreateWorkerProfileRequest) => Promise<void>;
  isLoading: boolean;
  error: string | null;
  success: boolean;
}

export function useWorkerRegister(): UseWorkerRegisterReturn {
  const navigate = useNavigate();
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  const register = async (data: CreateWorkerProfileRequest) => {
    setIsLoading(true);
    setError(null);
    setSuccess(false);

    try {
      await workerApiService.createProfile(data);
      setSuccess(true);
      // Redirigir al dashboard después de completar el perfil
      setTimeout(() => {
        navigate("/dashboard");
      }, 1500);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : "Error al registrar como trabajador";
      setError(errorMessage);
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

