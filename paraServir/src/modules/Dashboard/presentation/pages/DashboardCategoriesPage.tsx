import { CategoriesSection } from "@/shared/components/sections/CategoriesSection";
import { PageContainer } from "@/shared/components/layout/PageContainer";
import { PageHeader } from "@/shared/components/layout/PageHeader";
import { CategoryGrid } from "@/shared/components/sections/CategoryGrid";
import { useCategories } from "@/shared/hooks/useCategories";
import { buildRoute } from "@/shared/constants/routes.constants";
import { useNavigate } from "react-router-dom";
import { LoadingState } from "@/shared/components/feedback/LoadingState";
import { Alert, AlertDescription } from "@/shared/components/ui/alert";
import { AlertCircle } from "lucide-react";

export function DashboardCategoriesPage() {
  const navigate = useNavigate();
  const { categories, loading, error } = useCategories();

  const handleCategoryClick = (categoryId: string) => {
    // Navegar a la página de detalle de categoría
    navigate(buildRoute.categoryDetail(categoryId));
  };

  return (
    <PageContainer>
      <PageHeader
        title="Todas las Categorías"
        description="Explora todas las categorías de servicios disponibles y encuentra el profesional perfecto"
      />
      
      {loading ? (
        <LoadingState message="Cargando categorías..." variant="grid" count={8} />
      ) : error ? (
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      ) : (
        <div className="mt-8">
          <CategoryGrid
            categories={categories}
            loading={loading}
            onCategoryClick={handleCategoryClick}
          />
        </div>
      )}
    </PageContainer>
  );
}
