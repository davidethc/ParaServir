import { Button } from "@/shared/components/ui/button";
import { ArrowLeft } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { ROUTES } from "@/shared/constants/routes.constants";

interface BackButtonProps {
  /**
   * Ruta a la que redirigir. Si no se especifica, usa ROUTES.DASHBOARD.HOME
   */
  to?: string;
  /**
   * Texto del botón. Por defecto: "Volver"
   */
  label?: string;
  /**
   * Clase CSS adicional
   */
  className?: string;
}

/**
 * Botón de navegación hacia atrás unificado
 * Consistente en toda la aplicación
 */
export function BackButton({ 
  to = ROUTES.DASHBOARD.HOME, 
  label = "Volver",
  className 
}: BackButtonProps) {
  const navigate = useNavigate();

  return (
    <Button
      variant="ghost"
      onClick={() => navigate(to)}
      className={className}
    >
      <ArrowLeft className="h-4 w-4 mr-2" />
      {label}
    </Button>
  );
}
