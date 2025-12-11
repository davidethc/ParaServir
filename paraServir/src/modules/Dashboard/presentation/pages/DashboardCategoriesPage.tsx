import { CategoriesSection } from "@/shared/components/sections/CategoriesSection";
import { PageContainer } from "@/shared/components/layout/PageContainer";
import { PageHeader } from "@/shared/components/layout/PageHeader";

export function DashboardCategoriesPage() {
  return (
    <PageContainer>
      <PageHeader
        title="Todas las Categorías"
        description="Explora todas las categorías de servicios disponibles"
      />
      <CategoriesSection />
    </PageContainer>
  );
}
