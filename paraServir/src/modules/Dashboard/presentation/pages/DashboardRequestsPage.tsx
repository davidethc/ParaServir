import { PageContainer } from "@/shared/components/layout/PageContainer";
import { PageHeader } from "@/shared/components/layout/PageHeader";
import { EmptyState } from "@/shared/components/feedback/EmptyState";

export function DashboardRequestsPage() {
  return (
    <PageContainer>
      <PageHeader
        title="Mis Solicitudes"
        description="Gestiona tus solicitudes de servicios"
      />
      <EmptyState
        title="Próximamente: Gestión de solicitudes"
        description="Esta funcionalidad estará disponible pronto"
      />
    </PageContainer>
  );
}
