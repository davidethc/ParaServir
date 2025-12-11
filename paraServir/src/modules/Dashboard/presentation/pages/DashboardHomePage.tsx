import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { ROUTES, buildRoute } from "@/shared/constants/routes.constants";
import { CategoriesSection } from "@/shared/components/sections/CategoriesSection";
import { SearchBar } from "@/shared/components/forms/SearchBar";
import { ServiceCategoryController } from "@/modules/ServiceCategories/infra/http/controllers/service-category.controller";
import type { ServiceCategoryDto } from "@/modules/ServiceCategories/application/dto/service-category.dto";

export function DashboardHomePage() {
  const [categories, setCategories] = useState<ServiceCategoryDto[]>([]);
  const [loadingCategories, setLoadingCategories] = useState(true);
  const navigate = useNavigate();
  const categoryController = new ServiceCategoryController();

  // Cargar categorías para el selector
  useEffect(() => {
    const loadCategories = async () => {
      try {
        setLoadingCategories(true);
        const cats = await categoryController.getAllCategories();
        setCategories(cats);
      } catch (error) {
        console.error("Error loading categories:", error);
      } finally {
        setLoadingCategories(false);
      }
    };
    loadCategories();
  }, []);

  const handleSearch = (query: string, categoryId?: string) => {
    // Si se seleccionó una categoría, navegar a la página de detalle de esa categoría
    if (categoryId) {
      navigate(buildRoute.categoryDetail(categoryId));
      return;
    }
    // Si solo hay búsqueda de texto, navegar a resultados de búsqueda
    if (query) {
      navigate(ROUTES.DASHBOARD.SEARCH(query));
    }
  };

  const popularSearches = [
    "Diseñador Gráfico",
    "UI/UX",
    "Desarrollador Web",
  ];

  return (
    <div className="min-h-screen bg-white">
      {/* Header con búsqueda */}
      <div className="bg-white border-b border-gray-200 px-6 py-8">
        <div className="max-w-6xl mx-auto">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            Encuentra la solución a tu problema
          </h1>
          <p className="text-gray-600 mb-6">
            Busca lo que necesites para eso que quieres reparar o ese trabajo
            pendiente por hacer contamos con los profesionales mas calificados
          </p>

          {/* Barra de búsqueda unificada */}
          <SearchBar
            categories={categories.map((cat) => ({ id: cat.id, name: cat.name }))}
            loadingCategories={loadingCategories}
            popularSearches={popularSearches}
            onSearch={handleSearch}
          />
        </div>
      </div>

      {/* Sección de categorías */}
      <div className="px-6 py-8">
        <div className="max-w-6xl mx-auto">
          <CategoriesSection />
        </div>
      </div>
    </div>
  );
}
