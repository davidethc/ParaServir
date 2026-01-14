
import { Button } from "@/shared/components/ui/button";
import { Card } from "@/shared/components/ui/card";
import { useNavigate } from "react-router-dom";
import { ROUTES } from "@/shared/constants/routes.constants";
import { AuthFooter } from "@/shared/components/layout/AuthFooter";

export function SuccessResetForm() {
  const navigate = useNavigate();
  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-background">
      <div className="flex flex-col items-center justify-center w-full mt-12">
        <img src="src/shared/Assets/logo_servir.png" alt="Logo ParaServir" className="w-32 h-32 object-contain mb-2" />
        <h2 className="text-2xl font-bold text-center mb-2">Has cambiado tu contraseña exitosamente</h2>
        <p className="text-muted-foreground text-center mb-6 max-w-md">
          Recuerda siempre la contraseña de tu cuenta
        </p>
        <Card className="w-full max-w-md p-8 shadow-none border-none flex flex-col items-center">
          <Button className="w-full" onClick={() => navigate(ROUTES.PUBLIC.LOGIN)}>
            Volver al inicio de sesión
          </Button>
        </Card>
      </div>
      <AuthFooter />
    </div>
  );
}
