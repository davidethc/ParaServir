import { Card } from "@/shared/components/ui/card";
import { Badge } from "@/shared/components/ui/badge";
import { Button } from "@/shared/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/shared/components/ui/avatar";
import { Star, Clock, CheckCircle2, MapPin } from "lucide-react";
import { cn } from "@/shared/lib/utils";
import { getCategoryImage } from "@/shared/utils/category-images";
import { WhatsAppButton } from "@/shared/components/ui/whatsapp-button";
import { getWorkerAvatar } from "@/shared/utils/avatar-utils";

interface ServiceCardProps {
  id: string;
  title: string;
  description: string;
  basePrice?: number;
  isAvailable: boolean;
  workerName: string;
  workerAvatar?: string;
  workerPhone?: string;
  workerId?: string;
  rating?: number;
  reviewCount?: number;
  deliveryTime?: string;
  categoryName?: string;
  distanceKm?: number;
  workerLocation?: string;
  onClick?: (serviceId: string) => void;
  className?: string;
}

/**
 * Card profesional tipo marketplace para mostrar servicios
 * Diseño inspirado en Fiverr/Workana con jerarquía visual clara
 */
export function ServiceCard({
  id,
  title,
  description,
  basePrice,
  isAvailable,
  workerName,
  workerAvatar,
  workerPhone,
  workerId,
  rating,
  reviewCount,
  deliveryTime,
  categoryName,
  distanceKm,
  workerLocation,
  onClick,
  className,
}: ServiceCardProps) {
  const handleClick = () => {
    if (onClick) {
      onClick(id);
    }
  };

  const initials = workerName
    .split(" ")
    .map((n) => n[0])
    .join("")
    .toUpperCase()
    .slice(0, 2);

  // Generar avatar si no existe, usando el nombre o ID del trabajador
  const displayAvatar = getWorkerAvatar(
    workerId || id,
    workerAvatar,
    workerName.split(" ")[0],
    workerName.split(" ").slice(1).join(" ")
  );

  return (
    <Card
      className={cn(
        "group relative overflow-hidden border border-border bg-card",
        onClick && "cursor-pointer",
        !isAvailable && "opacity-75",
        className
      )}
      onClick={handleClick}
      role={onClick ? "button" : undefined}
      tabIndex={onClick ? 0 : undefined}
      onKeyDown={onClick ? (e) => {
        if (e.key === "Enter" || e.key === " ") {
          e.preventDefault();
          handleClick();
        }
      } : undefined}
    >
      {/* Imagen/Placeholder del servicio */}
      <div className="relative h-48 w-full bg-gradient-to-br from-primary/10 via-primary/5 to-muted overflow-hidden">
        {categoryName && (
          <div className="absolute top-3 left-3 z-10">
            <Badge variant="secondary" className="text-xs font-medium bg-white/90 backdrop-blur-sm">
              {categoryName}
            </Badge>
          </div>
        )}
        {!isAvailable && (
          <div className="absolute inset-0 bg-black/40 flex items-center justify-center z-10">
            <Badge variant="destructive" className="text-sm font-semibold">
              No disponible
            </Badge>
          </div>
        )}
        
        {/* Imagen de la categoría o placeholder */}
        {categoryName && getCategoryImage(categoryName) ? (
          <img
            src={getCategoryImage(categoryName)!}
            alt={categoryName}
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
          />
        ) : (
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="w-20 h-20 rounded-full bg-primary/20 flex items-center justify-center group-hover:scale-110 transition-transform duration-300">
              <span className="text-3xl font-bold text-primary/60">
                {title.charAt(0).toUpperCase()}
              </span>
            </div>
          </div>
        )}
      </div>

      {/* Contenido */}
      <div className="p-5 space-y-4">
        {/* Header: Worker info */}
        <div className="flex items-center gap-3">
          <Avatar className="h-10 w-10 border-2 border-background ring-2 ring-primary/10">
            <AvatarImage src={displayAvatar} alt={workerName} />
            <AvatarFallback className="bg-primary text-primary-foreground font-semibold text-sm">
              {initials}
            </AvatarFallback>
          </Avatar>
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2">
              <p className="text-sm font-medium text-foreground truncate">
                {workerName}
              </p>
              {workerPhone && (
                <WhatsAppButton
                  phone={workerPhone}
                  message={`Hola ${workerName}, me interesa el servicio: ${title}`}
                  variant="icon"
                  size="sm"
                  className="flex-shrink-0"
                />
              )}
            </div>
            {rating !== undefined && rating > 0 && (
              <div className="flex items-center gap-1 mt-0.5">
                <Star className="h-3.5 w-3.5 fill-warning text-warning" />
                <span className="text-xs font-semibold text-foreground">
                  {rating.toFixed(1)}
                </span>
                {reviewCount !== undefined && reviewCount > 0 && (
                  <span className="text-xs text-muted-foreground">
                    ({reviewCount})
                  </span>
                )}
              </div>
            )}
          </div>
        </div>

        {/* Título y descripción */}
        <div className="space-y-2">
          <h3 className="font-semibold text-lg text-foreground line-clamp-2 group-hover:text-primary transition-colors">
            {title}
          </h3>
          <p className="text-sm text-muted-foreground line-clamp-2 leading-relaxed">
            {description}
          </p>
        </div>

        {/* Footer: Precio y acciones */}
        <div className="flex items-center justify-between pt-2 border-t border-border/50">
          <div className="flex flex-col">
            {basePrice !== undefined && basePrice !== null ? (
              <>
                <span className="text-2xl font-bold text-success">
                  ${Number(basePrice).toFixed(2)}
                </span>
                <span className="text-xs text-muted-foreground">Precio base</span>
              </>
            ) : (
              <span className="text-sm text-muted-foreground">Precio a consultar</span>
            )}
          </div>
          
          <div className="flex items-center gap-3">
            {distanceKm !== undefined && (
              <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
                <MapPin className="h-3.5 w-3.5" />
                <span>{distanceKm < 1 ? `${(distanceKm * 1000).toFixed(0)}m` : `${distanceKm.toFixed(1)}km`}</span>
              </div>
            )}
            {workerLocation && !distanceKm && (
              <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
                <MapPin className="h-3.5 w-3.5" />
                <span className="truncate max-w-[120px]">{workerLocation}</span>
              </div>
            )}
            {deliveryTime && (
              <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
                <Clock className="h-3.5 w-3.5" />
                <span>{deliveryTime}</span>
              </div>
            )}
          </div>
        </div>

        {/* CTA Button */}
        {isAvailable && onClick && (
          <Button
            className="w-full mt-4 bg-primary hover:bg-primary-hover text-primary-foreground font-semibold shadow-sm"
            onClick={(e) => {
              e.stopPropagation();
              handleClick();
            }}
          >
            <CheckCircle2 className="h-4 w-4" />
            Contratar ahora
          </Button>
        )}
      </div>
    </Card>
  );
}
