import { LoadingState } from "@/shared/components/feedback/LoadingState";
import { Alert, AlertDescription } from "@/shared/components/ui/alert";
import { AlertCircle } from "lucide-react";
import { useMe } from "@/shared/hooks/useMe";
import { isWorker } from "@/shared/constants/user-roles.constants";
import { ClientReviewsList } from "@/modules/Reviews/presentation/components/ClientReviewsList";
import { WorkerReviewsList } from "@/modules/Reviews/presentation/components/WorkerReviewsList";
import { PageContainer } from "@/shared/components/layout/PageContainer";
import { PageHeader } from "@/shared/components/layout/PageHeader";

export function DashboardReviewsPage() {
  const { user, loading, error: userError, refetch } = useMe();

  if (loading) {
    return (
      <PageContainer>
        <LoadingState message="Cargando..." variant="list" count={3} />
      </PageContainer>
    );
  }

  if (userError || !user) {
    return (
      <PageContainer>
        <PageHeader
          title="Mis Reseñas"
          description="Error al cargar la información"
        />
        <Alert variant="destructive" className="mt-6">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>
            {userError || "No se pudo cargar la información del usuario"}
          </AlertDescription>
        </Alert>
      </PageContainer>
    );
  }

  const isWorkerRole = isWorker(user.role);

  return (
    <PageContainer>
      <PageHeader
        title={isWorkerRole ? "Mis Reseñas" : "Mis Reseñas"}
        description={
          isWorkerRole 
            ? "Reseñas que has recibido de tus clientes" 
            : "Reseñas que has escrito para trabajadores"
        }
      />
      
      <div className="mt-6">
        {isWorkerRole ? (
          <WorkerReviewsList workerId={user.id} showAverage={true} />
        ) : (
          <ClientReviewsList showAverage={true} />
        )}
      </div>
    </PageContainer>
  );
}
