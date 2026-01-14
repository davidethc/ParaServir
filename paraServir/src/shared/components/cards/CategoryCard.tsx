import { Card } from "@/shared/components/ui/card";
import { Badge } from "@/shared/components/ui/badge";
import { ArrowRight, Sparkles } from "lucide-react";
import type { ServiceCategoryDto } from "@/modules/ServiceCategories/application/dto/service-category.dto";
import { cn } from "@/shared/lib/utils";
import { getCategoryImage } from "@/shared/utils/category-images";

interface CategoryCardProps {
  category: ServiceCategoryDto;
  onClick?: (categoryId: string) => void;
  className?: string;
}

/**
 * Card profesional para categorías de servicios
 * Diseño limpio con imagen destacada y espaciado mejorado
 */
export function CategoryCard({ category, onClick, className }: CategoryCardProps) {
  const handleClick = () => {
    if (onClick) {
      onClick(category.id);
    }
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
      {/* Área de imagen - Ocupa todo el ancho */}
      <div className="relative w-full h-48 bg-gradient-to-br from-primary/20 via-primary/10 to-primary/5 overflow-hidden">
        {imageUrl ? (
          // Si hay imagen real, mostrarla
          <img
            src={imageUrl}
            alt={category.name}
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
          />
        ) : (
          // Placeholder mejorado con gradiente y icono
          <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-primary/30 via-primary/20 to-primary/10">
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

        {/* Badge de contador en esquina */}
        {(workersCount > 0 || servicesCount > 0) && (
          <div className="absolute top-3 right-3">
            <Badge variant="secondary" className="bg-white/90 backdrop-blur-sm text-xs font-semibold shadow-sm">
              <Sparkles className="h-3 w-3 mr-1" />
              {servicesCount > 0 ? servicesCount : workersCount}
            </Badge>
          </div>
        )}
      </div>
      
      {/* Contenido con mejor espaciado */}
      <div className="p-6">
        {/* Título y flecha */}
        <div className="flex items-start justify-between gap-3 mb-4">
          <h3 className="font-bold text-lg text-foreground group-hover:text-primary transition-colors flex-1 leading-tight">
            {category.name}
          </h3>
          <ArrowRight className="h-5 w-5 text-muted-foreground group-hover:text-primary group-hover:translate-x-1 transition-all duration-300 flex-shrink-0 mt-0.5" />
        </div>
        
        {/* Descripción con espaciado mejorado */}
        {category.description && (
          <p className="text-sm text-muted-foreground leading-relaxed mb-4">
            {category.description}
          </p>
        )}

        {/* Stats */}
        {(workersCount > 0 || servicesCount > 0) && (
          <div className="flex items-center gap-6 pt-4 border-t border-border/50">
            {workersCount > 0 && (
              <div className="flex flex-col">
                <span className="text-xs text-muted-foreground mb-1">Trabajadores</span>
                <span className="text-sm font-semibold text-foreground">{workersCount}</span>
              </div>
            )}
            {servicesCount > 0 && (
              <div className="flex flex-col">
                <span className="text-xs text-muted-foreground mb-1">Servicios</span>
                <span className="text-sm font-semibold text-foreground">{servicesCount}</span>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Indicador de hover */}
      <div className="absolute bottom-0 left-0 right-0 h-1 bg-gradient-to-r from-primary via-primary/50 to-primary transform scale-x-0 group-hover:scale-x-100 transition-transform duration-300 origin-left" />
    </Card>
  );
}

