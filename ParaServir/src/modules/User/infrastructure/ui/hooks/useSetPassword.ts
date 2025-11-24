import { useState } from "react";
import { userApiService } from "../services/userApiService";
import { useNavigate } from "react-router-dom";

interface UseSetPasswordReturn {
  setPassword: (password: string, confirmPassword: string) => Promise<void>;
  isLoading: boolean;
  error: string | null;
  success: boolean;
}

export function useSetPassword(): UseSetPasswordReturn {
  const navigate = useNavigate();
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  const setPassword = async (password: string, confirmPassword: string) => {
    setIsLoading(true);
    setError(null);
    setSuccess(false);

    try {
      if (password !== confirmPassword) {
        throw new Error("Las contraseñas no coinciden");
      }

      const token = sessionStorage.getItem("resetPasswordToken");
      if (!token) {
        throw new Error("Token no encontrado. Por favor, inicia el proceso nuevamente.");
      }

      await userApiService.setPassword(token, password);
      setSuccess(true);
      
      // Limpiar datos de sesión
      sessionStorage.removeItem("resetPasswordEmail");
      sessionStorage.removeItem("resetPasswordToken");
      
      // Redirigir a login después de un breve delay
      setTimeout(() => {
        navigate("/login");
      }, 2000);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : "Error al establecer la contraseña";
      setError(errorMessage);
    } finally {
      setIsLoading(false);
    }
  };

  return {
    setPassword,
    isLoading,
    error,
    success,
  };
}

