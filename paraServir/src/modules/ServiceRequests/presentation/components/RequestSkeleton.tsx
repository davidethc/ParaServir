import { Card } from '@/shared/components/ui/card';

export function RequestSkeleton() {
    return (
        <Card className="p-5 animate-pulse">
            {/* Header */}
            <div className="flex items-start justify-between mb-4">
                <div className="flex gap-3 flex-1">
                    {/* Avatar */}
                    <div className="w-12 h-12 rounded-full bg-muted" />
                    <div className="flex-1">
                        {/* Name */}
                        <div className="h-5 bg-muted rounded w-32 mb-2" />
                        {/* Rating */}
                        <div className="h-4 bg-muted rounded w-24" />
                    </div>
                </div>
                {/* Badge */}
                <div className="h-7 bg-muted rounded-full w-24" />
            </div>

            {/* Body */}
            <div className="mb-4">
                {/* Category */}
                <div className="h-3 bg-muted rounded w-20 mb-2" />
                {/* Title */}
                <div className="h-6 bg-muted rounded w-3/4 mb-2" />
                {/* Description */}
                <div className="h-4 bg-muted rounded w-full mb-1" />
                <div className="h-4 bg-muted rounded w-2/3" />
            </div>

            {/* Info Grid */}
            <div className="grid grid-cols-2 gap-3 mb-4">
                <div className="h-5 bg-muted rounded" />
                <div className="h-5 bg-muted rounded" />
                <div className="h-5 bg-muted rounded" />
                <div className="h-5 bg-muted rounded" />
            </div>

            {/* Footer */}
            <div className="flex gap-2 pt-3 border-t border-border">
                <div className="h-9 bg-muted rounded w-28" />
                <div className="h-9 bg-muted rounded w-24" />
            </div>
        </Card>
    );
}

export function RequestSkeletonList({ count = 3 }: { count?: number }) {
    return (
        <div className="space-y-4">
            {Array.from({ length: count }).map((_, i) => (
                <RequestSkeleton key={i} />
            ))}
        </div>
    );
}
