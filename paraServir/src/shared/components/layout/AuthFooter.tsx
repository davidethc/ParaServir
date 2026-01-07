import { Link } from "react-router-dom";

/**
 * Footer compartido para formularios de autenticación
 * Elimina código duplicado en Login, Register, ForgotPassword, etc.
 */
export function AuthFooter() {
  return (
    <footer className="text-xs text-muted-foreground text-center mt-8 mb-2 w-full">
      © 2025 Todos los derechos reservados. <span className="mx-1">·</span>
      <Link to="#" className="hover:underline">Términos y Condiciones</Link> <span className="mx-1">·</span>
      <Link to="#" className="hover:underline">Política de Privacidad</Link>
    </footer>
  );
}
