import { Skeleton } from "@/shared/components/ui/skeleton";
import { cn } from "@/shared/lib/utils";

/**
 * Loading skeleton for CategoryCard with pulse animation
 * Matches exact dimensions of the real card component
 */
export function CategoryCardSkeleton() {
    return (
        <div
            className={cn(
                "border-0 rounded-xl overflow-hidden bg-card",
                "shadow-[0_4px_6px_rgba(0,0,0,0.07)]"
            )}
        >
            {/* Image skeleton - 240px (h-60) */}
            <Skeleton className="h-60 w-full rounded-none" />

            {/* Content section - 20px padding */}
            <div className="p-5 space-y-4">
                {/* Title skeleton */}
                <Skeleton className="h-6 w-3/4" />

                {/* Description skeleton - 2 lines */}
                <div className="space-y-2">
                    <Skeleton className="h-4 w-full" />
                    <Skeleton className="h-4 w-5/6" />
                </div>

                {/* Stats skeleton */}
                <div className="flex items-center gap-4 pt-2">
                    <Skeleton className="h-16 w-32 rounded-lg" />
                    <Skeleton className="h-16 w-28 rounded-lg" />
                </div>
            </div>
        </div>
    );
}
