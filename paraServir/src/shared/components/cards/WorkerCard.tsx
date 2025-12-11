import { Card } from "@/shared/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/shared/components/ui/avatar";
import { Badge } from "@/shared/components/ui/badge";
import { MapPin, CheckCircle } from "lucide-react";
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
  onClick?: (workerId: string) => void;
  className?: string;
}

/**
 * Card unificado para mostrar información de trabajadores
 * Reutilizable y consistente en toda la aplicación
 */
export function WorkerCard({
  workerId,
  firstName,
  lastName,
  avatarUrl,
  location,
  yearsExperience,
  verificationStatus,
  servicesCount,
  minPrice,
  maxPrice,
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

  return (
    <Card
      className={cn(
        "p-4 hover:shadow-lg transition-shadow",
        onClick && "cursor-pointer",
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
      <div className="flex items-start gap-4">
        <Avatar className="h-12 w-12 flex-shrink-0">
          <AvatarImage src={avatarUrl} alt={`${firstName} ${lastName}`} />
          <AvatarFallback className="bg-blue-100 text-blue-700 font-semibold">
            {initials}
          </AvatarFallback>
        </Avatar>
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-1">
            <h3 className="font-semibold text-gray-900 truncate">
              {firstName} {lastName}
            </h3>
            {isVerified && (
              <CheckCircle className="h-4 w-4 text-green-600 flex-shrink-0" />
            )}
          </div>
          
          {yearsExperience !== undefined && yearsExperience > 0 && (
            <p className="text-sm text-gray-600 mb-2">
              {yearsExperience} {yearsExperience === 1 ? "año" : "años"} de experiencia
            </p>
          )}
          
          {location && (
            <div className="flex items-center gap-1 text-sm text-gray-500 mb-2">
              <MapPin className="h-3 w-3 flex-shrink-0" />
              <span className="truncate">{location}</span>
            </div>
          )}
          
          {minPrice !== undefined && maxPrice !== undefined && 
           minPrice !== null && maxPrice !== null && (
            <p className="text-sm font-medium text-blue-600 mb-2">
              ${Number(minPrice).toFixed(2)} - ${Number(maxPrice).toFixed(2)}
            </p>
          )}
          
          <Badge variant="secondary" className="text-xs">
            {servicesCount} servicio{servicesCount !== 1 ? "s" : ""}
          </Badge>
        </div>
      </div>
    </Card>
  );
}
