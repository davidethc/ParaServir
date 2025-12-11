import { Card } from "@/shared/components/ui/card";
import { Badge } from "@/shared/components/ui/badge";
import { cn } from "@/shared/lib/utils";

interface ServiceCardProps {
  id: string;
  title: string;
  description: string;
  basePrice?: number;
  isAvailable: boolean;
  workerName: string;
  onClick?: (serviceId: string) => void;
  className?: string;
}

/**
 * Card unificado para mostrar servicios
 * Reutilizable y consistente en toda la aplicación
 */
export function ServiceCard({
  id,
  title,
  description,
  basePrice,
  isAvailable,
  workerName,
  onClick,
  className,
}: ServiceCardProps) {
  const handleClick = () => {
    if (onClick) {
      onClick(id);
    }
  };

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
      <div className="flex justify-between items-start mb-2">
        <h3 className="font-semibold text-gray-900 flex-1">{title}</h3>
        {basePrice !== undefined && basePrice !== null && (
          <span className="text-lg font-bold text-blue-600 ml-4 flex-shrink-0">
            ${Number(basePrice).toFixed(2)}
          </span>
        )}
      </div>
      
      <p className="text-sm text-gray-600 mb-3 line-clamp-2">{description}</p>
      
      <div className="flex items-center justify-between">
        <span className="text-sm text-gray-500">Por: {workerName}</span>
        {isAvailable && (
          <Badge variant="default" className="bg-green-600">
            Disponible
          </Badge>
        )}
      </div>
    </Card>
  );
}
