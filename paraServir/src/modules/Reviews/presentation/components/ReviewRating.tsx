import { Star } from "lucide-react";
import { cn } from "@/shared/lib/utils";

interface ReviewRatingProps {
  rating: number;
  maxRating?: number;
  size?: "sm" | "md" | "lg";
  showValue?: boolean;
  className?: string;
}

export function ReviewRating({ 
  rating, 
  maxRating = 5, 
  size = "md",
  showValue = false,
  className 
}: ReviewRatingProps) {
  const sizeClasses = {
    sm: "h-4 w-4",
    md: "h-4 w-4",
    lg: "h-5 w-5",
  };

  const fullStars = Math.floor(rating);
  const hasHalfStar = rating % 1 >= 0.5;
  const emptyStars = maxRating - fullStars - (hasHalfStar ? 1 : 0);

  return (
    <div className={cn("flex items-center gap-0.5", className)}>
      <div className="flex items-center">
        {/* Estrellas llenas */}
        {Array.from({ length: fullStars }).map((_, i) => (
          <Star
            key={`full-${i}`}
            className={cn(sizeClasses[size], "fill-[#F4B840] text-[#F4B840]")}
          />
        ))}
        
        {/* Media estrella (opcional, solo si hay decimal >= 0.5) */}
        {hasHalfStar && (
          <div className="relative">
            <Star
              className={cn(sizeClasses[size], "text-gray-300")}
            />
            <Star
              className={cn(sizeClasses[size], "fill-[#F4B840] text-[#F4B840] absolute top-0 left-0 overflow-hidden")}
              style={{ width: '50%', clipPath: 'inset(0 50% 0 0)' }}
            />
          </div>
        )}
        
        {/* Estrellas vacías */}
        {Array.from({ length: emptyStars }).map((_, i) => (
          <Star
            key={`empty-${i}`}
            className={cn(sizeClasses[size], "text-gray-300 fill-gray-300")}
          />
        ))}
      </div>
      
      {showValue && (
        <span className="text-sm font-medium text-muted-foreground ml-1">
          {rating.toFixed(1)}
        </span>
      )}
    </div>
  );
}
