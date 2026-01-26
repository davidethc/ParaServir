import { PageContainer } from "@/shared/components/layout/PageContainer";
import { PageHeader } from "@/shared/components/layout/PageHeader";
import { NotificationList } from "@/modules/Notifications/presentation/components/NotificationList";
import { Card } from "@/shared/components/ui/card";

export function DashboardNotificationsPage() {
  return (
    <PageContainer>
      <PageHeader
        title="Notificaciones"
        description="Mantente al día con tus mensajes y asignaciones de trabajo"
      />
      <div className="mt-6">
        <Card className="overflow-hidden border border-border shadow-sm">
          <NotificationList />
        </Card>
      </div>
    </PageContainer>
  );
}
