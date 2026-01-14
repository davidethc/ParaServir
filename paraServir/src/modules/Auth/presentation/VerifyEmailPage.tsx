import { useEffect, useState } from "react";
import { useSearchParams, useNavigate } from "react-router-dom";
import { Button } from "@/shared/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/shared/components/ui/card";
import { Alert, AlertDescription } from "@/shared/components/ui/alert";
import { VerifyEmailUseCase } from "@/modules/Auth/application/use-cases/verify-email.use-case";
import { ROUTES } from "@/shared/constants/routes.constants";
import { CheckCircle2, XCircle, Loader2 } from "lucide-react";

export function VerifyEmailPage() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const verifyEmail = async () => {
      const token = searchParams.get("token");

      if (!token) {
        setError("Token de verificación no proporcionado");
        setLoading(false);
        return;
      }

      setLoading(true);
      setError(null);

      try {
        const useCase = new VerifyEmailUseCase();
        const result = await useCase.execute(token);
        
        if (result.status === "success") {
          setSuccess(true);
          // Redirigir al login después de 3 segundos
          setTimeout(() => {
            navigate(ROUTES.PUBLIC.LOGIN);
          }, 3000);
        } else {
          setError(result.message || "Error al verificar el email");
        }
      } catch (err) {
        const errorMessage = err instanceof Error ? err.message : "Error al verificar el email";
        setError(errorMessage);
      } finally {
        setLoading(false);
      }
    };

    void verifyEmail();
  }, [searchParams, navigate]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-background p-4">
      <Card className="w-full max-w-md">
        <CardHeader>
          <CardTitle className="text-2xl text-center">Verificación de Email</CardTitle>
          <CardDescription className="text-center">
            Verificando tu dirección de correo electrónico
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {loading && (
            <div className="flex flex-col items-center gap-4 py-8">
              <Loader2 className="h-12 w-12 animate-spin text-primary" />
              <p className="text-sm text-muted-foreground">Verificando tu email...</p>
            </div>
          )}

          {success && (
            <Alert className="bg-green-50 text-green-900 border-green-200">
              <CheckCircle2 className="h-4 w-4 text-green-600" />
              <AlertDescription>
                <strong>¡Email verificado exitosamente!</strong>
                <p className="mt-2 text-sm">Serás redirigido al inicio de sesión en unos segundos...</p>
              </AlertDescription>
            </Alert>
          )}

          {error && !loading && (
            <Alert variant="destructive">
              <XCircle className="h-4 w-4" />
              <AlertDescription>
                <strong>Error al verificar el email</strong>
                <p className="mt-2 text-sm">{error}</p>
              </AlertDescription>
            </Alert>
          )}

          {!loading && (
            <div className="flex gap-3">
              <Button
                variant="outline"
                onClick={() => navigate(ROUTES.PUBLIC.HOME)}
                className="flex-1"
              >
                Ir al Inicio
              </Button>
              {!success && (
                <Button
                  onClick={() => navigate(ROUTES.PUBLIC.LOGIN)}
                  className="flex-1"
                >
                  Ir a Login
                </Button>
              )}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
