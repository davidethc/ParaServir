import { PageContainer } from "@/shared/components/layout/PageContainer";
import { PageHeader } from "@/shared/components/layout/PageHeader";
import { EmptyState } from "@/shared/components/feedback/EmptyState";

export function DashboardHelpPage() {
  return (
    <PageContainer>
      <PageHeader
        title="Centro de Ayuda"
        description="Encuentra respuestas a tus preguntas"
      />
      <EmptyState
        title="Próximamente: Centro de ayuda"
        description="Esta funcionalidad estará disponible pronto"
      />
    </PageContainer>
  );
}
