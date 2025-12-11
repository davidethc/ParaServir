import { PageContainer } from "@/shared/components/layout/PageContainer";
import { PageHeader } from "@/shared/components/layout/PageHeader";
import { EmptyState } from "@/shared/components/feedback/EmptyState";

export function DashboardSettingsPage() {
  return (
    <PageContainer>
      <PageHeader
        title="Configuración"
        description="Gestiona tu cuenta y preferencias"
      />
      <EmptyState
        title="Próximamente: Configuración de cuenta"
        description="Esta funcionalidad estará disponible pronto"
      />
    </PageContainer>
  );
}
