import { useEffect } from "react";
import { useDispatch } from "react-redux";
import { login } from "@/Store/slices/authSlice";
import { AuthStorageService } from "@/shared/services/auth-storage.service";

/**
 * Componente que inicializa el estado de autenticación desde localStorage
 * Se ejecuta al cargar la aplicación para restaurar la sesión
 * 
 * BUENAS PRÁCTICAS:
 * - Usa AuthStorageService para acceso consistente a localStorage
 * - Restaura estado de Redux desde localStorage
 * - Limpia datos inválidos automáticamente
 */
export function AuthInitializer({ children }: { children: React.ReactNode }) {
  const dispatch = useDispatch();

  useEffect(() => {
    // Obtener datos de autenticación usando servicio centralizado
    const authData = AuthStorageService.getAuthData();

    // Si hay datos válidos, restaurar estado de autenticación en Redux
    if (authData) {
      dispatch(
        login({
          id: authData.userId,
          email: authData.userEmail,
          role: authData.userRole,
        })
      );
    } else {
      // Si no hay datos completos, limpiar cualquier dato residual
      AuthStorageService.clearAuthData();
    }
  }, [dispatch]);

  return <>{children}</>;
}
