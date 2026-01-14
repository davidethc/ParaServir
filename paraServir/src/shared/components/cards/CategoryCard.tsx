import { Card } from "@/shared/components/ui/card";
import { Badge } from "@/shared/components/ui/badge";
import { ArrowRight, Users, Briefcase, Heart } from "lucide-react";
import type { ServiceCategoryDto } from "@/modules/ServiceCategories/application/dto/service-category.dto";
import { cn } from "@/shared/lib/utils";
import { getCategoryImage } from "@/shared/Utils/category-images";
import { useState } from "react";

interface CategoryCardProps {
  category: ServiceCategoryDto;
  onClick?: (categoryId: string) => void;
  onFavoriteToggle?: (categoryId: string, isFavorite: boolean) => void;
  className?: string;
}

/**
 * Modern category card with glassmorphism effects and microinteractions
 * Features: hover animations, quick actions, favorite toggle, icon-based stats
 */
export function CategoryCard({
  category,
  onClick,
  onFavoriteToggle,
  className
}: CategoryCardProps) {
  const [isFavorite, setIsFavorite] = useState(category.isFavorite ?? false);

  const handleClick = () => {
    if (onClick) {
      onClick(category.id);
    }
  };

  const handleFavoriteToggle = (e: React.MouseEvent) => {
    e.stopPropagation();
    const newFavoriteState = !isFavorite;
    setIsFavorite(newFavoriteState);
    if (onFavoriteToggle) {
      onFavoriteToggle(category.id, newFavoriteState);
    }
  };

  const handleQuickAction = (e: React.MouseEvent) => {
    e.stopPropagation();
    handleClick();
  };

  const icon = category.icon || category.name.charAt(0).toUpperCase();
  const workersCount = category.workers_count ?? 0;
  const servicesCount = category.services_count ?? 0;

  // Obtener imagen de la categoría desde Assets
  const imageUrl = getCategoryImage(category.name) || (category as any).image_url || (category as any).imageUrl || null;

  return (
    <Card
      className={cn(
        "group relative overflow-hidden cursor-pointer",
        "border-0 rounded-xl",
        "shadow-[0_4px_6px_rgba(0,0,0,0.07)]",
        "hover:shadow-[0_20px_25px_rgba(0,0,0,0.15)]",
        "hover:-translate-y-2",
        "transition-all duration-300 ease-in-out",
        className
      )}
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
      {/* Image Area with Overlay Gradient - 240px height */}
      <div className="relative w-full h-60 overflow-hidden">
        {imageUrl ? (
          <>
            {/* Real image */}
            <img
              src={imageUrl}
              alt={category.name}
              className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500 ease-out"
            />
            {/* Gradient overlay */}
            <div
              className="absolute inset-0 bg-linear-to-b from-transparent via-transparent to-black/70"
              style={{
                background: 'linear-gradient(180deg, transparent 60%, rgba(0,0,0,0.7) 100%)'
              }}
            />
          </>
        ) : (
          // Placeholder with gradient and icon
          <div className="w-full h-full flex items-center justify-center bg-linear-to-br from-primary/30 via-primary/20 to-primary/10">
            <div className="w-24 h-24 rounded-xl bg-white/20 backdrop-blur-sm flex items-center justify-center shadow-lg group-hover:scale-110 transition-transform duration-300">
              {category.icon ? (
                <span className="text-5xl">{category.icon}</span>
              ) : (
                <span className="text-4xl font-bold text-primary">
                  {icon}
                </span>
              )}
            </div>
          </div>
        )}

        {/* Glassmorphism Badge - Counter */}
        {(workersCount > 0 || servicesCount > 0) && (
          <div className="absolute top-3 right-3">
            <Badge
              className={cn(
                "bg-white/95 backdrop-blur-sm",
                "border border-white/30",
                "shadow-[0_2px_8px_rgba(0,0,0,0.1)]",
                "text-[13px] font-semibold",
                "px-3 py-1.5 rounded-[20px]"
              )}
              style={{
                color: '#58A3B0'
              }}
            >
              #{servicesCount > 0 ? servicesCount : workersCount}
            </Badge>
          </div>
        )}

        {/* Favorite/Bookmark Toggle - Top Left */}
        <button
          onClick={handleFavoriteToggle}
          className={cn(
            "absolute top-3 left-3 z-10",
            "w-9 h-9 rounded-full",
            "bg-white/95 backdrop-blur-sm",
            "border border-white/30",
            "shadow-[0_2px_8px_rgba(0,0,0,0.1)]",
            "flex items-center justify-center",
            "transition-all duration-200",
            "hover:scale-110 active:scale-95",
            "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2"
          )}
          aria-label={isFavorite ? "Quitar de favoritos" : "Agregar a favoritos"}
        >
          <Heart
            className={cn(
              "h-4 w-4 transition-colors duration-200",
              isFavorite ? "fill-primary text-primary" : "text-gray-400"
            )}
          />
        </button>
      </div>

      {/* Content Section - 20px padding */}
      <div className="p-5">
        {/* Title */}
        <h3 className="text-[20px] font-bold text-foreground mb-4 leading-tight line-clamp-1">
          {category.name}
        </h3>

        {/* Description - Limited to 2 lines */}
        {category.description && (
          <p className="text-sm text-muted-foreground leading-relaxed mb-4 line-clamp-2">
            {category.description}
          </p>
        )}

        {/* Enhanced Statistics Section with Icons */}
        {(workersCount > 0 || servicesCount > 0) && (
          <div className="flex items-center gap-4 mt-4">
            {workersCount > 0 && (
              <div
                className="flex items-center gap-2 px-3 py-2 rounded-lg"
                style={{ backgroundColor: '#F9FAFB' }}
              >
                <Users className="h-4 w-4" style={{ color: '#58A3B0' }} />
                <div className="flex flex-col">
                  <span className="text-xs text-muted-foreground">Trabajadores</span>
                  <span className="text-sm font-bold" style={{ color: '#1F2937' }}>
                    {workersCount}
                  </span>
                </div>
              </div>
            )}
            {servicesCount > 0 && (
              <div
                className="flex items-center gap-2 px-3 py-2 rounded-lg"
                style={{ backgroundColor: '#F9FAFB' }}
              >
                <Briefcase className="h-4 w-4" style={{ color: '#58A3B0' }} />
                <div className="flex flex-col">
                  <span className="text-xs text-muted-foreground">Servicios</span>
                  <span className="text-sm font-bold" style={{ color: '#1F2937' }}>
                    {servicesCount}
                  </span>
                </div>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Quick Action Button - Appears on Hover */}
      <button
        onClick={handleQuickAction}
        className={cn(
          "absolute bottom-4 right-4",
          "flex items-center gap-2",
          "px-5 py-2.5 rounded-lg",
          "text-sm font-medium text-white",
          "transition-all duration-300 ease-out",
          "opacity-0 translate-y-5 group-hover:opacity-100 group-hover:translate-y-0",
          "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white focus-visible:ring-offset-2 focus-visible:ring-offset-primary"
        )}
        style={{ backgroundColor: '#58A3B0' }}
        aria-label="Ver servicios de esta categoría"
      >
        Ver servicios
        <ArrowRight className="h-4 w-4" />
      </button>

      {/* Bottom Accent Line (subtle hover indicator) */}
      <div className="absolute bottom-0 left-0 right-0 h-1 bg-linear-to-r from-primary via-primary/50 to-primary transform scale-x-0 group-hover:scale-x-100 transition-transform duration-300 origin-left" />
    </Card>
  );
}
