import { Card } from "@/shared/components/ui/card";
import type { ServiceCategoryDto } from "@/modules/ServiceCategories/application/dto/service-category.dto";

interface CategoryCardProps {
  category: ServiceCategoryDto;
  onClick?: (categoryId: string) => void;
}

export function CategoryCard({ category, onClick }: CategoryCardProps) {
  const handleClick = () => {
    if (onClick) {
      onClick(category.id);
    }
  };

  return (
    <Card
      className="group relative overflow-hidden cursor-pointer transition-all duration-300 hover:shadow-lg hover:scale-[1.02] border border-gray-200 bg-white"
      onClick={handleClick}
      role="button"
      tabIndex={0}
      onKeyDown={(e) => {
        if (e.key === "Enter" || e.key === " ") {
          e.preventDefault();
          handleClick();
        }
      }}
      aria-label={`Explorar categoría ${category.name}`}
    >
      <div className="relative h-32 bg-gradient-to-br from-blue-50 to-blue-100 overflow-hidden">
        {/* Placeholder para imagen - puede ser reemplazado con imagen real */}
        <div className="absolute inset-0 flex items-center justify-center">
          <div className="w-16 h-16 bg-blue-200 rounded-lg flex items-center justify-center opacity-60 group-hover:opacity-80 transition-opacity">
            <span className="text-2xl font-bold text-blue-600">
              {category.name.charAt(0).toUpperCase()}
            </span>
          </div>
        </div>
      </div>
      
      <div className="p-4">
        <h3 className="font-semibold text-gray-900 text-lg mb-1 group-hover:text-blue-600 transition-colors">
          {category.name}
        </h3>
        {category.jobCount !== undefined && (
          <p className="text-sm text-gray-600">
            {category.jobCount.toLocaleString()} trabajos disponibles
          </p>
        )}
        {category.description && (
          <p className="text-xs text-gray-500 mt-1 line-clamp-2">
            {category.description}
          </p>
        )}
      </div>
    </Card>
  );
}

