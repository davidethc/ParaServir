import { ProtectedRoute } from "./ProtectedRoute";
import type { UserRole } from "@/shared/constants/user-roles.constants";

interface RoleProtectedRouteProps {
  children: React.ReactNode;
  /**
   * Rol requerido para acceder a la ruta
   */
  requiredRole: UserRole;
}

/**
 * Componente que protege rutas que requieren un rol específico
 * 
 * SIMPLIFICADO: ProtectedRoute ya valida el rol si se pasa requiredRole,
 * por lo que este componente solo actúa como un wrapper semántico más claro.
 * 
 * Uso:
 * <RoleProtectedRoute requiredRole="trabajador">
 *   <Componente />
 * </RoleProtectedRoute>
 */
export function RoleProtectedRoute({
  children,
  requiredRole,
}: RoleProtectedRouteProps) {
  // ProtectedRoute ya maneja la validación de rol y redirección
  return (
    <ProtectedRoute requiredRole={requiredRole}>
      {children}
    </ProtectedRoute>
  );
}
