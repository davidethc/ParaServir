import type { ReactNode } from "react";
import { Search, Inbox, Package, AlertCircle } from "lucide-react";
import { cn } from "@/shared/lib/utils";
import { Button } from "@/shared/components/ui/button";

interface EmptyStateProps {
  title?: string;
  description?: string;
  icon?: ReactNode;
  action?: {
    label: string;
    onClick: () => void;
  };
  className?: string;
  variant?: "default" | "search" | "inbox" | "package" | "error";
}

/**
 * Componente profesional para estados vacíos
 * Diseño moderno con iconos contextuales y mejor UX
 */
export function EmptyState({
  title = "No hay elementos disponibles",
  description,
  icon,
  action,
  className,
  variant = "default",
}: EmptyStateProps) {
  // Iconos por defecto según variante
  const defaultIcons = {
    default: <Package className="h-16 w-16 text-muted-foreground/30" />,
    search: <Search className="h-16 w-16 text-muted-foreground/30" />,
    inbox: <Inbox className="h-16 w-16 text-muted-foreground/30" />,
    package: <Package className="h-16 w-16 text-muted-foreground/30" />,
    error: <AlertCircle className="h-16 w-16 text-destructive/30" />,
  };

  const displayIcon = icon || defaultIcons[variant];

  return (
    <div
      className={cn(
        "flex flex-col items-center justify-center py-16 px-4",
        "text-center max-w-md mx-auto",
        className
      )}
    >
      {/* Icono con contenedor decorativo */}
      <div className="relative mb-6">
        <div className="absolute inset-0 bg-primary/5 rounded-full blur-2xl" />
        <div className="relative flex items-center justify-center">
          {displayIcon}
        </div>
      </div>

      {/* Título */}
      <h3 className="text-xl font-bold text-foreground mb-2">{title}</h3>

      {/* Descripción */}
      {description && (
        <p className="text-sm md:text-base text-muted-foreground mb-6 leading-relaxed max-w-sm">
          {description}
        </p>
      )}

      {/* Acción */}
      {action && (
        <Button
          onClick={action.onClick}
          className="bg-primary hover:bg-primary-hover text-primary-foreground font-semibold shadow-sm"
        >
          {action.label}
        </Button>
      )}
    </div>
  );
}
