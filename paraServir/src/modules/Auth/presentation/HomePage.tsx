import { useSelector } from "react-redux";
import type { RootState } from "@/Store";

export function HomePage() {
  const user = useSelector((state: RootState) => state.auth.user);

  return (
    <div className="min-h-screen flex items-center justify-center bg-white">
      <div className="text-center space-y-4">
        <h1 className="text-3xl font-bold text-gray-800">Bienvenido</h1>
        {user && (
          <p className="text-gray-600">
            Sesión iniciada como <strong>{user.email}</strong>
            {user.role ? ` · Rol: ${user.role}` : ""}
          </p>
        )}
        <p className="text-gray-500">Aquí irá el dashboard o página principal.</p>
      </div>
    </div>
  );
}

