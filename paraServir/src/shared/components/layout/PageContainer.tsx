import { cn } from "@/shared/lib/utils";

interface PageContainerProps {
  children: React.ReactNode;
  className?: string;
  maxWidth?: "sm" | "md" | "lg" | "xl" | "2xl" | "6xl" | "full";
}

/**
 * Contenedor base para todas las páginas
 * Unifica el padding, max-width y estructura común
 */
export function PageContainer({ 
  children, 
  className,
  maxWidth = "6xl"
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
    <div className={cn("min-h-screen bg-white p-6", className)}>
      <div className={cn("mx-auto", maxWidthClasses[maxWidth])}>
        {children}
      </div>
    </div>
  );
}
