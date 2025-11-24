import { useState } from "react";
import { userApiService } from "../services/userApiService";
import { useNavigate } from "react-router-dom";

interface UseVerifyCodeReturn {
  verify: (code: string) => Promise<void>;
  resendCode: () => Promise<void>;
  isLoading: boolean;
  error: string | null;
  success: boolean;
}

export function useVerifyCode(): UseVerifyCodeReturn {
  const navigate = useNavigate();
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  const getEmail = (): string => {
    return sessionStorage.getItem("resetPasswordEmail") || "";
  };

  const verify = async (code: string) => {
    setIsLoading(true);
    setError(null);
    setSuccess(false);

    try {
      const email = getEmail();
      if (!email) {
        throw new Error("Email no encontrado. Por favor, inicia el proceso nuevamente.");
      }

      const response = await userApiService.verifyCode(email, code);
      // Guardar token para la siguiente pantalla
      sessionStorage.setItem("resetPasswordToken", response.token);
      setSuccess(true);
      // Redirigir a establecer contraseña
      setTimeout(() => {
        navigate("/set-password");
      }, 1500);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : "Error al verificar el código";
      setError(errorMessage);
    } finally {
      setIsLoading(false);
    }
  };

  const resendCode = async () => {
    setIsLoading(true);
    setError(null);

    try {
      const email = getEmail();
      if (!email) {
        throw new Error("Email no encontrado");
      }

      await userApiService.forgotPassword(email);
      setSuccess(true);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : "Error al reenviar el código";
      setError(errorMessage);
    } finally {
      setIsLoading(false);
    }
  };

  return {
    verify,
    resendCode,
    isLoading,
    error,
    success,
  };
}

