import { CategoryCard } from "@/shared/components/cards/CategoryCard";
import { CategoryCardSkeleton } from "@/shared/components/skeletons/CategoryCardSkeleton";
import type { ServiceCategoryDto } from "@/modules/ServiceCategories/application/dto/service-category.dto";

interface CategoryGridProps {
  categories: ServiceCategoryDto[];
  loading?: boolean;
  onCategoryClick?: (categoryId: string) => void;
  onFavoriteToggle?: (categoryId: string, isFavorite: boolean) => void;
}

/**
 * Responsive grid for category cards
 * Breakpoints: 1 col (mobile) → 2 cols (tablet) → 3 cols (desktop) → 4 cols (xl)
 */
export function CategoryGrid({
  categories,
  loading = false,
  onCategoryClick,
  onFavoriteToggle
}: CategoryGridProps) {
  if (loading) {
    return (
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
        {Array.from({ length: 8 }).map((_, index) => (
          <CategoryCardSkeleton key={index} />
        ))}
      </div>
    );
  }

  if (categories.length === 0) {
    return (
      <div className="text-center py-12">
        <p className="text-muted-foreground">No hay categorías disponibles en este momento.</p>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
      {categories.map((category) => (
        <CategoryCard
          key={category.id}
          category={category}
          onClick={onCategoryClick}
          onFavoriteToggle={onFavoriteToggle}
        />
      ))}
    </div>
  );
}

