import { Card } from "@/shared/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/shared/components/ui/avatar";
import { Badge } from "@/shared/components/ui/badge";
import { Button } from "@/shared/components/ui/button";
import { MapPin, CheckCircle2, Star, Briefcase, TrendingUp } from "lucide-react";
import { cn } from "@/shared/lib/utils";

interface WorkerCardProps {
  workerId: string;
  firstName: string;
  lastName: string;
  avatarUrl?: string;
  phone?: string;
  location?: string;
  yearsExperience?: number;
  verificationStatus: string;
  isActive: boolean;
  servicesCount: number;
  minPrice?: number;
  maxPrice?: number;
  rating?: number;
  completedJobs?: number;
  onClick?: (workerId: string) => void;
  className?: string;
}

/**
 * Card profesional para mostrar información de trabajadores
 * Diseño tipo marketplace con jerarquía visual clara y información destacada
 */
export function WorkerCard({
  workerId,
  firstName,
  lastName,
  avatarUrl,
  location,
  yearsExperience,
  verificationStatus,
  isActive,
  servicesCount,
  minPrice,
  maxPrice,
  rating,
  completedJobs,
  onClick,
  className,
}: WorkerCardProps) {
  const handleClick = () => {
    if (onClick) {
      onClick(workerId);
    }
  };

  const initials = `${firstName.charAt(0)}${lastName.charAt(0)}`.toUpperCase();
  const isVerified = verificationStatus === "verified";
  const fullName = `${firstName} ${lastName}`;

  return (
    <Card
      className={cn(
        "group relative overflow-hidden border border-border bg-card",
        onClick && "cursor-pointer",
        !isActive && "opacity-75",
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
      {/* Header con gradiente sutil */}
      <div className="relative h-20 bg-gradient-to-r from-primary/10 via-primary/5 to-transparent">
        <div className="absolute bottom-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-border to-transparent" />
      </div>

      {/* Contenido principal */}
      <div className="px-5 pb-5 -mt-12 relative">
        {/* Avatar destacado */}
        <div className="relative inline-block mb-3">
          <Avatar className="h-20 w-20 border-4 border-background ring-4 ring-primary/10 shadow-lg">
            <AvatarImage src={avatarUrl} alt={fullName} />
            <AvatarFallback className="bg-primary text-primary-foreground font-bold text-lg">
              {initials}
            </AvatarFallback>
          </Avatar>
          {isVerified && (
            <div className="absolute -bottom-1 -right-1 bg-success rounded-full p-1 shadow-md border-2 border-background">
              <CheckCircle2 className="h-4 w-4 text-success-foreground" />
            </div>
          )}
        </div>

        {/* Nombre y verificación */}
        <div className="mb-4">
          <div className="flex items-center gap-2 mb-1">
            <h3 className="font-bold text-lg text-foreground group-hover:text-primary transition-colors">
              {fullName}
            </h3>
          </div>
          
          {/* Stats rápidas */}
          <div className="flex items-center gap-3 flex-wrap mt-2">
            {rating !== undefined && rating > 0 && (
              <div className="flex items-center gap-1 text-sm">
                <Star className="h-4 w-4 fill-warning text-warning" />
                <span className="font-semibold text-foreground">{rating.toFixed(1)}</span>
              </div>
            )}
            {completedJobs !== undefined && completedJobs > 0 && (
              <div className="flex items-center gap-1 text-sm text-muted-foreground">
                <Briefcase className="h-4 w-4" />
                <span>{completedJobs} trabajos</span>
              </div>
            )}
            {yearsExperience !== undefined && yearsExperience > 0 && (
              <div className="flex items-center gap-1 text-sm text-muted-foreground">
                <TrendingUp className="h-4 w-4" />
                <span>{yearsExperience} {yearsExperience === 1 ? "año" : "años"}</span>
              </div>
            )}
          </div>
        </div>

        {/* Ubicación */}
        {location && (
          <div className="flex items-center gap-2 text-sm text-muted-foreground mb-4">
            <MapPin className="h-4 w-4 flex-shrink-0" />
            <span className="truncate">{location}</span>
          </div>
        )}

        {/* Rango de precios destacado */}
        {minPrice !== undefined && maxPrice !== undefined && 
         minPrice !== null && maxPrice !== null && (
          <div className="mb-4 p-3 bg-success-light rounded-lg border border-success/20">
            <p className="text-xs font-medium text-muted-foreground mb-1">Rango de precios</p>
            <p className="text-xl font-bold text-success">
              ${Number(minPrice).toFixed(2)} - ${Number(maxPrice).toFixed(2)}
            </p>
          </div>
        )}

        {/* Footer con servicios y CTA */}
        <div className="flex items-center justify-between pt-4 border-t border-border/50">
          <Badge variant="secondary" className="font-medium">
            {servicesCount} servicio{servicesCount !== 1 ? "s" : ""} disponible{servicesCount !== 1 ? "s" : ""}
          </Badge>
          
          {onClick && isActive && (
            <Button
              size="sm"
              className="bg-primary hover:bg-primary-hover text-primary-foreground font-semibold"
              onClick={(e) => {
                e.stopPropagation();
                handleClick();
              }}
            >
              Ver perfil
            </Button>
          )}
        </div>
      </div>
    </Card>
  );
}
