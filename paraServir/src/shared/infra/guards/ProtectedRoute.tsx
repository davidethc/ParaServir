import { Navigate } from "react-router-dom";
import { useEffect, useState } from "react";
import { ROUTES } from "@/shared/constants/routes.constants";
import { useAuth } from "@/shared/hooks/useAuth";
import type { UserRole } from "@/shared/constants/user-roles.constants";

interface ProtectedRouteProps {
  children: React.ReactNode;
  /**
   * Rol requerido para acceder a la ruta (opcional)
   * Si se especifica, solo usuarios con ese rol pueden acceder
   */
  requiredRole?: UserRole;
}

/**
 * Componente que protege rutas que requieren autenticación
 * Redirige al login si el usuario no está autenticado
 * Valida token y estado de autenticación
 * 
 * MEJORADO:
 * - Usa hook useAuth unificado
 * - Elimina lógica duplicada de sincronización
 * - Más simple y mantenible
 */
export function ProtectedRoute({ children, requiredRole }: ProtectedRouteProps) {
  const { isAuthenticated, user, getToken } = useAuth();
  const [isReady, setIsReady] = useState(false);

  useEffect(() => {
    // Dar tiempo para que AuthInitializer restaure la autenticación
    // No restaurar aquí para evitar duplicación y ciclos infinitos
    const timer = setTimeout(() => {
      setIsReady(true);
    }, 100);

    return () => clearTimeout(timer);
  }, []);

  // Mostrar loading mientras validamos
  if (!isReady) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-muted-foreground">Cargando...</div>
      </div>
    );
  }

  // Verificar autenticación
  const token = getToken();
  if (!isAuthenticated || !user || !token) {
    return <Navigate to={ROUTES.PUBLIC.LOGIN} replace />;
  }

  // Verificar rol si se requiere
  if (requiredRole && user.role !== requiredRole) {
    // Redirigir al dashboard si no tiene el rol requerido
    return <Navigate to={ROUTES.DASHBOARD.HOME} replace />;
  }

  return <>{children}</>;
}

