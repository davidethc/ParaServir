import { cn } from "@/shared/lib/utils";

interface PageContainerProps {
  children: React.ReactNode;
  className?: string;
  maxWidth?: "sm" | "md" | "lg" | "xl" | "2xl" | "6xl" | "full";
  /**
   * Si es true, aplica fondo blanco. Si es false, el fondo es transparente.
   * Útil cuando el contenedor padre ya tiene fondo.
   */
  withBackground?: boolean;
}

/**
 * Contenedor base para todas las páginas
 * Unifica el padding, max-width y estructura común
 * Diseño profesional con espaciado consistente
 */
export function PageContainer({ 
  children, 
  className,
  maxWidth = "6xl",
  withBackground = false,
}: PageContainerProps) {
  const maxWidthClasses = {
    sm: "max-w-sm",
    md: "max-w-md",
    lg: "max-w-lg",
    xl: "max-w-xl",
    "2xl": "max-w-2xl",
    "6xl": "max-w-6xl",
    full: "max-w-full",
  };

  return (
    <div 
      className={cn(
        "w-full",
        withBackground && "min-h-screen bg-background",
        "p-4 sm:p-6 lg:p-8",
        className
      )}
    >
      <div className={cn("mx-auto", maxWidthClasses[maxWidth])}>
        {children}
      </div>
    </div>
  );
}
