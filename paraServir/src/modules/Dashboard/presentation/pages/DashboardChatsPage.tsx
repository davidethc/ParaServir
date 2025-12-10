import { PageContainer } from "@/shared/components/layout/PageContainer";
import { PageHeader } from "@/shared/components/layout/PageHeader";
import { EmptyState } from "@/shared/components/feedback/EmptyState";

export function DashboardChatsPage() {
  return (
    <PageContainer>
      <PageHeader
        title="Chats"
        description="Conversaciones con trabajadores y clientes"
      />
      <EmptyState
        title="Próximamente: Sistema de mensajería"
        description="Esta funcionalidad estará disponible pronto"
      />
    </PageContainer>
  );
}
