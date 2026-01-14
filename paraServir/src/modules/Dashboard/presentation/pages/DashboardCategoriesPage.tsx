import { useState, useMemo } from "react";
import { CategoryGrid } from "@/shared/components/sections/CategoryGrid";
import { PageContainer } from "@/shared/components/layout/PageContainer";
import { useCategories } from "@/shared/hooks/useCategories";
import { buildRoute } from "@/shared/constants/routes.constants";
import { useNavigate } from "react-router-dom";
import { LoadingState } from "@/shared/components/feedback/LoadingState";
import { Alert, AlertDescription } from "@/shared/components/ui/alert";
import { AlertCircle, Search, X } from "lucide-react";
import { Input } from "@/shared/components/ui/input";
import { Badge } from "@/shared/components/ui/badge";
import { cn } from "@/shared/lib/utils";

type FilterType = "all" | "popular" | "recent" | "workers";

/**
 * Enhanced categories page with search and filter functionality
 * Features: sticky header, search bar, filter chips, modern layout
 */
export function DashboardCategoriesPage() {
  const navigate = useNavigate();
  const { categories, loading, error } = useCategories();

  const [searchQuery, setSearchQuery] = useState("");
  const [activeFilter, setActiveFilter] = useState<FilterType>("all");

  const handleCategoryClick = (categoryId: string) => {
    navigate(buildRoute.categoryDetail(categoryId));
  };

  const handleFavoriteToggle = (categoryId: string, isFavorite: boolean) => {
    // Store favorite state in localStorage
    const favorites = JSON.parse(localStorage.getItem("categoryFavorites") || "{}");
    if (isFavorite) {
      favorites[categoryId] = true;
    } else {
      delete favorites[categoryId];
    }
    localStorage.setItem("categoryFavorites", JSON.stringify(favorites));
  };

  // Filter and sort categories based on search and active filter
  const filteredCategories = useMemo(() => {
    let result = [...categories];

    // Apply search filter
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase();
      result = result.filter(
        (cat) =>
          cat.name.toLowerCase().includes(query) ||
          cat.description?.toLowerCase().includes(query)
      );
    }

    // Apply sorting based on active filter
    switch (activeFilter) {
      case "popular":
        result.sort((a, b) => (b.services_count ?? 0) - (a.services_count ?? 0));
        break;
      case "recent":
        result.sort((a, b) => {
          if (!a.created_at || !b.created_at) return 0;
          return new Date(b.created_at).getTime() - new Date(a.created_at).getTime();
        });
        break;
      case "workers":
        result.sort((a, b) => (b.workers_count ?? 0) - (a.workers_count ?? 0));
        break;
      default:
        // "all" - keep original order
        break;
    }

    return result;
  }, [categories, searchQuery, activeFilter]);

  const clearSearch = () => {
    setSearchQuery("");
  };

  return (
    <PageContainer>
      {/* Enhanced Sticky Header */}
      <div className="sticky top-0 z-10 bg-card border-b border-border shadow-sm mb-8 -mx-6 px-6 py-6">
        <div className="max-w-7xl mx-auto">
          {/* Title and Description */}
          <div className="mb-6">
            <h1 className="text-3xl font-bold text-foreground mb-2">
              Todas las Categorías
            </h1>
            <p className="text-muted-foreground">
              Explora todas las categorías de servicios disponibles y encuentra el profesional perfecto
            </p>
          </div>

          {/* Search and Filters Row */}
          <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between">
            {/* Search Bar */}
            <div className="relative w-full sm:w-96">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                type="text"
                placeholder="Buscar categorías..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10 pr-10"
              />
              {searchQuery && (
                <button
                  onClick={clearSearch}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
                  aria-label="Limpiar búsqueda"
                >
                  <X className="h-4 w-4" />
                </button>
              )}
            </div>

            {/* Filter Chips */}
            <div className="flex flex-wrap gap-2">
              <Badge
                variant={activeFilter === "all" ? "default" : "outline"}
                className={cn(
                  "cursor-pointer transition-all duration-200 px-4 py-2 text-sm",
                  activeFilter === "all"
                    ? "bg-primary text-primary-foreground hover:bg-primary-hover"
                    : "hover:bg-muted"
                )}
                onClick={() => setActiveFilter("all")}
              >
                Todas
              </Badge>
              <Badge
                variant={activeFilter === "popular" ? "default" : "outline"}
                className={cn(
                  "cursor-pointer transition-all duration-200 px-4 py-2 text-sm",
                  activeFilter === "popular"
                    ? "bg-primary text-primary-foreground hover:bg-primary-hover"
                    : "hover:bg-muted"
                )}
                onClick={() => setActiveFilter("popular")}
              >
                Más populares
              </Badge>
              <Badge
                variant={activeFilter === "workers" ? "default" : "outline"}
                className={cn(
                  "cursor-pointer transition-all duration-200 px-4 py-2 text-sm",
                  activeFilter === "workers"
                    ? "bg-primary text-primary-foreground hover:bg-primary-hover"
                    : "hover:bg-muted"
                )}
                onClick={() => setActiveFilter("workers")}
              >
                Más trabajadores
              </Badge>
              <Badge
                variant={activeFilter === "recent" ? "default" : "outline"}
                className={cn(
                  "cursor-pointer transition-all duration-200 px-4 py-2 text-sm",
                  activeFilter === "recent"
                    ? "bg-primary text-primary-foreground hover:bg-primary-hover"
                    : "hover:bg-muted"
                )}
                onClick={() => setActiveFilter("recent")}
              >
                Recientes
              </Badge>
            </div>
          </div>

          {/* Search Results Counter */}
          {searchQuery && (
            <p className="text-sm text-muted-foreground mt-4">
              {filteredCategories.length} {filteredCategories.length === 1 ? "resultado" : "resultados"} para "{searchQuery}"
            </p>
          )}
        </div>
      </div>

      {/* Categories Grid */}
      {loading ? (
        <LoadingState message="Cargando categorías..." variant="grid" count={8} />
      ) : error ? (
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      ) : filteredCategories.length === 0 ? (
        <div className="text-center py-12">
          <p className="text-muted-foreground text-lg">
            No se encontraron categorías que coincidan con tu búsqueda.
          </p>
          {searchQuery && (
            <button
              onClick={clearSearch}
              className="mt-4 text-primary hover:text-primary-hover transition-colors font-medium"
            >
              Limpiar búsqueda
            </button>
          )}
        </div>
      ) : (
        <CategoryGrid
          categories={filteredCategories}
          loading={loading}
          onCategoryClick={handleCategoryClick}
          onFavoriteToggle={handleFavoriteToggle}
        />
      )}
    </PageContainer>
  );
}
