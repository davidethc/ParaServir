import { PageContainer } from "@/shared/components/layout/PageContainer";
import { PageHeader } from "@/shared/components/layout/PageHeader";
import { CreateServiceRequestForm } from "../components/CreateServiceRequestForm";

export function CreateServiceRequestPage() {
  return (
    <PageContainer>
      <PageHeader
        title="Crear solicitud"
        description="Solicita un servicio a un trabajador"
      />
      <CreateServiceRequestForm />
    </PageContainer>
  );
}
