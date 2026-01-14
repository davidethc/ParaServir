import { useState } from "react";
import { Button } from "@/shared/components/ui/button";
import { Loader2 } from "lucide-react";
import { GoogleAuthService } from "../../application/services/google-auth.service";
import { useAuth } from "@/shared/hooks/useAuth";
import { useNavigate } from "react-router-dom";
import { getPostLoginRoute } from "@/shared/constants/routes.constants";

interface GoogleAuthButtonProps {
  variant?: "default" | "outline";
  className?: string;
}

export function GoogleAuthButton({ variant = "outline", className }: GoogleAuthButtonProps) {
  const [loading, setLoading] = useState(false);
  const { login } = useAuth();
  const navigate = useNavigate();
  const googleAuthService = new GoogleAuthService();

  const handleGoogleAuth = async () => {
    setLoading(true);

    try {
      // En producción, usarías Google Identity Services
      // Por ahora, simulamos la autenticación
      // Necesitarás configurar Google OAuth en Google Cloud Console
      
      // Ejemplo de implementación básica (requiere configuración de Google OAuth)
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      if (typeof window !== 'undefined' && (window as any).google) {
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const authInstance = (window as any).google.accounts.oauth2.initTokenClient({
          client_id: import.meta.env.VITE_GOOGLE_CLIENT_ID || '',
          scope: 'email profile',
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          callback: async (response: any) => {
            try {
              // Obtener información del usuario de Google
              const userInfo = await fetch('https://www.googleapis.com/oauth2/v2/userinfo', {
                headers: {
                  Authorization: `Bearer ${response.access_token}`
                }
              }).then(res => res.json());

              // Autenticar con nuestro backend
              const authResponse = await googleAuthService.authenticate(
                response.access_token,
                userInfo.email,
                userInfo.name,
                userInfo.picture
              );

              if (authResponse.token) {
                login({
                  id: authResponse.user.id,
                  email: authResponse.user.email,
                  role: authResponse.user.role,
                  token: authResponse.token,
                });

                const redirectRoute = getPostLoginRoute(authResponse.user.role);
                navigate(redirectRoute);
              }
            } catch (error) {
              console.error('Error en autenticación Google:', error);
              alert('Error al autenticar con Google. Por favor intenta de nuevo.');
            } finally {
              setLoading(false);
            }
          }
        });

        authInstance.requestAccessToken();
      } else {
        // Fallback: mostrar mensaje de que Google OAuth no está configurado
        alert('Google OAuth no está configurado. Por favor usa el registro con email.');
        setLoading(false);
      }
    } catch (error) {
      console.error('Error en Google Auth:', error);
      setLoading(false);
    }
  };

  return (
    <Button
      type="button"
      variant={variant}
      className={`w-full flex items-center justify-center gap-2 ${className}`}
      onClick={handleGoogleAuth}
      disabled={loading}
    >
      {loading ? (
        <>
          <Loader2 className="h-5 w-5 animate-spin" />
          Conectando...
        </>
      ) : (
        <>
          <img src="https://www.svgrepo.com/show/475656/google-color.svg" alt="Google" className="h-5 w-5" />
          Google
        </>
      )}
    </Button>
  );
}
