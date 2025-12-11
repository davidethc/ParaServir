import { CategoryCard } from "@/shared/components/cards/CategoryCard";
import { Skeleton } from "@/shared/components/ui/skeleton";
import type { ServiceCategoryDto } from "@/modules/ServiceCategories/application/dto/service-category.dto";

interface CategoryGridProps {
  categories: ServiceCategoryDto[];
  loading?: boolean;
  onCategoryClick?: (categoryId: string) => void;
}

function CategoryCardSkeleton() {
  return (
    <div className="border border-gray-200 rounded-lg overflow-hidden bg-white">
      <Skeleton className="h-32 w-full" />
      <div className="p-4 space-y-2">
        <Skeleton className="h-5 w-3/4" />
        <Skeleton className="h-4 w-1/2" />
      </div>
    </div>
  );
}

export function CategoryGrid({ categories, loading = false, onCategoryClick }: CategoryGridProps) {
  if (loading) {
    return (
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        {Array.from({ length: 8 }).map((_, index) => (
          <CategoryCardSkeleton key={index} />
        ))}
      </div>
    );
  }

  if (categories.length === 0) {
    return (
      <div className="text-center py-12">
        <p className="text-gray-500">No hay categorías disponibles en este momento.</p>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
      {categories.map((category) => (
        <CategoryCard
          key={category.id}
          category={category}
          onClick={onCategoryClick}
        />
      ))}
    </div>
  );
}

