import { Navigate } from "react-router-dom";
import { useSelector } from "react-redux";
import { useEffect, useState } from "react";
import type { RootState } from "@/Store";
import { ROUTES } from "@/shared/constants/routes.constants";
import { AuthStorageService } from "@/shared/services/auth-storage.service";

interface ProtectedRouteProps {
  children: React.ReactNode;
  /**
   * Rol requerido para acceder a la ruta (opcional)
   * Si se especifica, solo usuarios con ese rol pueden acceder
   */
  requiredRole?: "usuario" | "trabajador" | "admin";
}

/**
 * Componente que protege rutas que requieren autenticación
 * Redirige al login si el usuario no está autenticado
 * Valida token y estado de autenticación
 */
export function ProtectedRoute({ children, requiredRole }: ProtectedRouteProps) {
  const isAuthenticated = useSelector(
    (state: RootState) => state.auth.isAuthenticated
  );
  const user = useSelector((state: RootState) => state.auth.user);
  const token = AuthStorageService.getToken();
  const [isValidating, setIsValidating] = useState(true);

  useEffect(() => {
    // Validar que tenemos token y estado de autenticación
    const validateAuth = () => {
      if (!token) {
        setIsValidating(false);
        return;
      }

      // Si hay token pero no está autenticado en Redux, intentar restaurar estado
      if (token && !isAuthenticated) {
        // Si tenemos token, el usuario debería estar autenticado
        // Esto puede pasar al recargar la página
        // Por ahora, confiamos en el token, pero idealmente deberíamos validarlo con el backend
        setIsValidating(false);
        return;
      }

      setIsValidating(false);
    };

    validateAuth();
  }, [token, isAuthenticated]);

  // Mostrar loading mientras validamos
  if (isValidating) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-gray-500">Cargando...</div>
      </div>
    );
  }

  // Verificar autenticación
  if (!isAuthenticated || !token) {
    return <Navigate to={ROUTES.PUBLIC.LOGIN} replace />;
  }

  // Verificar rol si se requiere
  if (requiredRole && user?.role !== requiredRole) {
    // Redirigir al dashboard si no tiene el rol requerido
    return <Navigate to={ROUTES.DASHBOARD.HOME} replace />;
  }

  return <>{children}</>;
}

