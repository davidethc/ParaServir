import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { buildRoute } from "@/shared/constants/routes.constants";
import { CategoryGrid } from "./CategoryGrid";
import { ServiceCategoryController } from "@/modules/ServiceCategories/infra/http/controllers/service-category.controller";
import type { ServiceCategoryDto } from "@/modules/ServiceCategories/application/dto/service-category.dto";

export function CategoriesSection() {
  const [categories, setCategories] = useState<ServiceCategoryDto[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const navigate = useNavigate();

  const categoryController = new ServiceCategoryController();

  useEffect(() => {
    const loadCategories = async () => {
      try {
        setLoading(true);
        setError(null);
        const cats = await categoryController.getAllCategories();
        setCategories(cats);
      } catch (err) {
        console.error("Error loading categories:", err);
        setError("Error al cargar categorías. Por favor intenta más tarde.");
      } finally {
        setLoading(false);
      }
    };

    loadCategories();
  }, []);

  const handleCategoryClick = (categoryId: string) => {
    // Navegar a la página de detalle de categoría
    navigate(buildRoute.categoryDetail(categoryId));
  };

  return (
    <section className="py-16 bg-white" aria-labelledby="categories-heading">
      <div className="container mx-auto px-4">
        <div className="text-center mb-12">
          <h2
            id="categories-heading"
            className="text-3xl md:text-4xl font-bold text-gray-900 mb-3"
          >
            Explora nuestras Categorías de Servicios
          </h2>
          <p className="text-lg text-gray-600 max-w-2xl mx-auto">
            Comienza buscando en nuestras categorías. Cientos de nuevos trabajos cada día!
          </p>
        </div>

        {error ? (
          <div className="text-center py-8">
            <p className="text-red-600">{error}</p>
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

