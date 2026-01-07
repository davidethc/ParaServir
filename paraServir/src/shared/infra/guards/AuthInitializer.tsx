import { useEffect } from "react";
import { useAuth } from "@/shared/hooks/useAuth";

/**
 * Componente que inicializa el estado de autenticación desde localStorage
 * Se ejecuta al cargar la aplicación para restaurar la sesión
 * 
 * MEJORADO:
 * - Usa el hook useAuth unificado
 * - Elimina lógica duplicada
 * - Más simple y mantenible
 */
export function AuthInitializer({ children }: { children: React.ReactNode }) {
  const { restoreFromStorage } = useAuth();

  useEffect(() => {
    // Restaurar autenticación desde localStorage usando hook unificado
    // Solo se ejecuta una vez al montar el componente
    restoreFromStorage();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []); // Array vacío: solo ejecutar al montar

  return <>{children}</>;
}
