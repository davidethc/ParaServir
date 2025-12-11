import { Navigate } from "react-router-dom";
import { useSelector } from "react-redux";
import type { RootState } from "@/Store";
import { ProtectedRoute } from "./ProtectedRoute";
import { ROUTES } from "@/shared/constants/routes.constants";

interface RoleProtectedRouteProps {
  children: React.ReactNode;
  /**
   * Rol requerido para acceder a la ruta
   */
  requiredRole: "usuario" | "trabajador" | "admin";
  /**
   * Ruta a la que redirigir si no tiene el rol requerido
   * Por defecto: ROUTES.DASHBOARD.HOME
   */
  redirectTo?: string;
}

/**
 * Componente que protege rutas que requieren un rol específico
 * Extiende ProtectedRoute y agrega validación de rol
 */
export function RoleProtectedRoute({
  children,
  requiredRole,
  redirectTo = ROUTES.DASHBOARD.HOME,
}: RoleProtectedRouteProps) {
  const user = useSelector((state: RootState) => state.auth.user);

  // Primero verificar autenticación con ProtectedRoute
  return (
    <ProtectedRoute requiredRole={requiredRole}>
      {user?.role === requiredRole ? (
        <>{children}</>
      ) : (
        <Navigate to={redirectTo} replace />
      )}
    </ProtectedRoute>
  );
}
