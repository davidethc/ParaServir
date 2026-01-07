import { Skeleton } from "@/shared/components/ui/skeleton";
import { cn } from "@/shared/lib/utils";

interface LoadingStateProps {
  /**
   * Número de elementos skeleton a mostrar
   */
  count?: number;
  /**
   * Tipo de skeleton: "card" | "list" | "grid"
   */
  variant?: "card" | "list" | "grid";
  className?: string;
  /**
   * Mensaje de carga opcional
   */
  message?: string;
}

/**
 * Componente unificado para estados de carga
 * Consistente en toda la aplicación
 */
export function LoadingState({ 
  count = 6, 
  variant = "card",
  className,
  message
}: LoadingStateProps) {
  if (variant === "card") {
    return (
      <div className={cn("space-y-4", className)}>
        {message && (
          <div className="text-center text-muted-foreground mb-4">
            {message}
          </div>
        )}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {Array.from({ length: count }).map((_, i) => (
            <div key={i} className="border border-border rounded-lg overflow-hidden bg-card">
              <Skeleton className="h-32 w-full" />
              <div className="p-4 space-y-2">
                <Skeleton className="h-5 w-3/4" />
                <Skeleton className="h-4 w-1/2" />
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  if (variant === "list") {
    return (
      <div className={cn("space-y-4", className)}>
        {Array.from({ length: count }).map((_, i) => (
          <Skeleton key={i} className="h-20 w-full" />
        ))}
      </div>
    );
  }

  if (variant === "grid") {
    return (
      <div className={cn("grid grid-cols-1 md:grid-cols-2 gap-4", className)}>
        {Array.from({ length: count }).map((_, i) => (
          <Skeleton key={i} className="h-32 w-full" />
        ))}
      </div>
    );
  }

  return null;
}
