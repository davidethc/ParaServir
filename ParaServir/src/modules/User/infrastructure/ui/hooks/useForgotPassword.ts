import { useState } from "react";
import { userApiService } from "../services/userApiService";
import { useNavigate } from "react-router-dom";

interface UseForgotPasswordReturn {
  sendEmail: (email: string) => Promise<void>;
  isLoading: boolean;
  error: string | null;
  success: boolean;
}

export function useForgotPassword(): UseForgotPasswordReturn {
  const navigate = useNavigate();
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  const sendEmail = async (email: string) => {
    setIsLoading(true);
    setError(null);
    setSuccess(false);

    try {
      await userApiService.forgotPassword(email);
      setSuccess(true);
      // Guardar email en sessionStorage para usarlo en la siguiente pantalla
      sessionStorage.setItem("resetPasswordEmail", email);
      // Redirigir a verificar código después de un breve delay
      setTimeout(() => {
        navigate("/verify-code");
      }, 1500);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : "Error al enviar el correo";
      setError(errorMessage);
    } finally {
      setIsLoading(false);
    }
  };

  return {
    sendEmail,
    isLoading,
    error,
    success,
  };
}

