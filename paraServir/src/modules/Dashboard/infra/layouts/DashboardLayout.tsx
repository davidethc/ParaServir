import { Outlet } from "react-router-dom";
import { DashboardSidebar } from "../../presentation/components/DashboardSidebar";

/**
 * Layout principal del Dashboard
 * Mantiene el sidebar visible mientras cambian las rutas
 */
export function DashboardLayout() {
  return (
    <div className="flex h-screen bg-gray-50">
      {/* Sidebar persistente */}
      <DashboardSidebar />
      
      {/* Contenido principal que cambia según la ruta */}
      <main className="flex-1 overflow-y-auto">
        <Outlet />
      </main>
    </div>
  );
}
