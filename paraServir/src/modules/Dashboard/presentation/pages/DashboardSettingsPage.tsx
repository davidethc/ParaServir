import { Outlet, Link } from "react-router-dom";
import { PageContainer } from "@/shared/components/layout/PageContainer";
import { PageHeader } from "@/shared/components/layout/PageHeader";
import { Button } from "@/shared/components/ui/button";

export function DashboardSettingsPage() {
  return (
    <PageContainer>
      <PageHeader
        title="Configuración"
        description="Gestiona tu cuenta y preferencias"
      />

      <div className="flex gap-6">
        {/* Menú lateral de configuración */}
        <aside className="w-56 space-y-2">
          <Link to="profile">
            <Button variant="ghost" className="w-full justify-start">
              Perfil
            </Button>
          </Link>

          <Button variant="ghost" disabled className="w-full justify-start">
            Seguridad
          </Button>

          <Button variant="ghost" disabled className="w-full justify-start">
            Preferencias
          </Button>
        </aside>

        {/* Contenido */}
        <main className="flex-1">
          <Outlet />
        </main>
      </div>
    </PageContainer>
  );
}
