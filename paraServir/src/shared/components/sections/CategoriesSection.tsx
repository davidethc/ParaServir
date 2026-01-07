import { useNavigate } from "react-router-dom";
import { buildRoute } from "@/shared/constants/routes.constants";
import { CategoryGrid } from "./CategoryGrid";
import { useCategories } from "@/shared/hooks/useCategories";

export function CategoriesSection() {
  const navigate = useNavigate();
  const { categories, loading, error } = useCategories();

  const handleCategoryClick = (categoryId: string) => {
    // Navegar a la página de detalle de categoría
    navigate(buildRoute.categoryDetail(categoryId));
  };

  return (
    <section className="py-16 bg-secondary" aria-labelledby="categories-heading">
      <div className="container mx-auto px-4">
        <div className="text-center mb-12">
          <h2
            id="categories-heading"
            className="text-3xl md:text-4xl font-semibold text-foreground mb-3 leading-tight"
          >
            Explora nuestras Categorías de Servicios
          </h2>
          <p className="text-lg text-text-secondary max-w-2xl mx-auto leading-relaxed">
            Comienza buscando en nuestras categorías. Cientos de nuevos trabajos cada día!
          </p>
        </div>

        {error ? (
          <div className="text-center py-8">
            <p className="text-destructive">{error}</p>
          </div>
        ) : (
          <CategoryGrid
            categories={categories}
            loading={loading}
            onCategoryClick={handleCategoryClick}
          />
        )}
      </div>
    </section>
  );
}

