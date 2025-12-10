import { Navigate } from "react-router-dom";
import { useSelector } from "react-redux";
import type { RootState } from "@/Store";
import { getPostLoginRoute } from "@/shared/constants/routes.constants";
import { AuthStorageService } from "@/shared/services/auth-storage.service";

interface PublicRouteProps {
  children: React.ReactNode;
}

/**
 * Componente que protege rutas públicas (login, register)
 * Redirige según el rol del usuario si ya está autenticado
 * Usuarios normales → categorías, Trabajadores → crear servicio
 */
export function PublicRoute({ children }: PublicRouteProps) {
  const isAuthenticated = useSelector(
    (state: RootState) => state.auth.isAuthenticated
  );
  const user = useSelector((state: RootState) => state.auth.user);
  const token = AuthStorageService.getToken();

  // Si el usuario está autenticado, redirigir según su rol
  if (isAuthenticated && token && user) {
    const redirectRoute = getPostLoginRoute(user.role);
    return <Navigate to={redirectRoute} replace />;
  }

  return <>{children}</>;
}
