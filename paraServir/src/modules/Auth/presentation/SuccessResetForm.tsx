
import { Button } from "@/shared/components/ui/button";
import { Card } from "@/shared/components/ui/card";
import { Link, useNavigate } from "react-router-dom";
import { ROUTES } from "@/shared/constants/routes.constants";

export function SuccessResetForm() {
  const navigate = useNavigate();
  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-white">
      <div className="flex flex-col items-center justify-center w-full mt-12">
        <img src="src/shared/Assets/logo_servir.png" alt="Logo ParaServir" className="w-32 h-32 object-contain mb-2" />
        <h2 className="text-2xl font-bold text-center mb-2">Has cambiado tu contraseña exitosamente</h2>
        <p className="text-gray-600 text-center mb-6 max-w-md">
          Recuerda siempre la contraseña de tu cuenta
        </p>
        <Card className="w-full max-w-md p-8 shadow-none border-none flex flex-col items-center">
          <Button className="w-full bg-gray-900 text-white hover:bg-gray-800" onClick={() => navigate(ROUTES.PUBLIC.LOGIN)}>
            Volver al inicio de sesión
          </Button>
        </Card>
      </div>
      <footer className="text-xs text-gray-400 text-center mt-8 mb-2 w-full">
        © 2025 Todos los derechos reservados. <span className="mx-1">·</span>
        <Link to="#" className="hover:underline">Términos y Condiciones</Link> <span className="mx-1">·</span>
        <Link to="#" className="hover:underline">Política de Privacidad</Link>
      </footer>
    </div>
  );
}
