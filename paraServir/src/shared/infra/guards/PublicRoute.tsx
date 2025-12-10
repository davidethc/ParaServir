import { Navigate } from "react-router-dom";
import { useSelector } from "react-redux";
import type { RootState } from "@/Store";
import { ROUTES } from "@/shared/constants/routes.constants";
import { AuthStorageService } from "@/shared/services/auth-storage.service";

interface PublicRouteProps {
  children: React.ReactNode;
}

/**
 * Componente que protege rutas públicas (login, register)
 * Redirige al dashboard si el usuario ya está autenticado
 */
export function PublicRoute({ children }: PublicRouteProps) {
  const isAuthenticated = useSelector(
    (state: RootState) => state.auth.isAuthenticated
  );
  const token = AuthStorageService.getToken();

  // Si el usuario está autenticado, redirigir al dashboard
  if (isAuthenticated && token) {
    return <Navigate to={ROUTES.DASHBOARD.HOME} replace />;
  }

  return <>{children}</>;
}
