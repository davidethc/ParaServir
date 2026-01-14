import { Badge } from '@/shared/components/ui/badge';
import { cn } from '@/shared/lib/utils';

interface RequestFiltersProps {
    current: string;
    onChange: (status: string) => void;
    counts: {
        all: number;
        pending: number;
        accepted: number;
        in_progress: number;
        completed: number;
        cancelled: number;
    };
}

const filters = [
    { value: 'all', label: 'Todas', key: 'all' as const },
    { value: 'pending', label: 'Pendientes', key: 'pending' as const, color: '#F59E0B' },
    { value: 'accepted', label: 'Aceptadas', key: 'accepted' as const, color: '#1D4ED8' },
    { value: 'in_progress', label: 'En progreso', key: 'in_progress' as const, color: '#6D28D9' },
    { value: 'completed', label: 'Completadas', key: 'completed' as const, color: '#10B981' },
    { value: 'cancelled', label: 'Canceladas', key: 'cancelled' as const, color: '#6B7280' },
];

export function RequestFilters({ current, onChange, counts }: RequestFiltersProps) {
    return (
        <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-hide">
            {filters.map((filter) => {
                const isActive = current === filter.value;
                const count = counts[filter.key];

                return (
                    <button
                        key={filter.value}
                        onClick={() => onChange(filter.value)}
                        className={cn(
                            'flex items-center gap-2 px-4 py-2 rounded-full shrink-0',
                            'border-2 font-medium text-sm transition-all duration-200',
                            'hover:shadow-sm',
                            isActive
                                ? 'border-primary bg-primary/10 text-primary'
                                : 'border-border bg-white text-muted-foreground hover:border-muted-foreground/30'
                        )}
                        style={
                            isActive
                                ? {
                                    borderColor: '#58A3B0',
                                    backgroundColor: 'rgba(88, 163, 176, 0.1)',
                                    color: '#58A3B0',
                                }
                                : undefined
                        }
                    >
                        <span>{filter.label}</span>
                        <Badge
                            variant="secondary"
                            className="h-5 min-w-[20px] px-1.5 text-xs font-semibold"
                            style={
                                isActive && filter.color
                                    ? {
                                        backgroundColor: filter.color,
                                        color: 'white',
                                    }
                                    : undefined
                            }
                        >
                            {count}
                        </Badge>
                    </button>
                );
            })}
        </div>
    );
}
