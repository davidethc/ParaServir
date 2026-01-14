import { Button } from '@/shared/components/ui/button';
import { Card } from '@/shared/components/ui/card';
import { FileX, Package, Wrench, Hammer, Plus } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { ROUTES } from '@/shared/constants/routes.constants';

interface RequestsEmptyStateProps {
    isClient: boolean;
}

const popularCategories = [
    {
        id: '1',
        name: 'Plomería',
        icon: Wrench,
        workers: 12,
        color: '#58A3B0',
    },
    {
        id: '2',
        name: 'Carpintería',
        icon: Hammer,
        workers: 8,
        color: '#5877B0',
    },
    {
        id: '3',
        name: 'Electricidad',
        icon: Package,
        workers: 15,
        color: '#6558B0',
    },
];

export function RequestsEmptyState({ isClient }: RequestsEmptyStateProps) {
    const navigate = useNavigate();

    return (
        <div className="flex flex-col items-center justify-center py-16 px-4">
            {/* Icon Illustration */}
            <div className="relative mb-6">
                <div
                    className="w-48 h-48 rounded-full flex items-center justify-center"
                    style={{
                        background: 'linear-gradient(135deg, rgba(88,163,176,0.1) 0%, rgba(88,119,176,0.1) 100%)',
                    }}
                >
                    <FileX size={80} style={{ color: '#58A3B0' }} strokeWidth={1.5} />
                </div>
                {/* Decorative circles */}
                <div
                    className="absolute -top-2 -right-2 w-16 h-16 rounded-full opacity-20"
                    style={{ backgroundColor: '#6558B0' }}
                />
                <div
                    className="absolute -bottom-4 -left-4 w-12 h-12 rounded-full opacity-20"
                    style={{ backgroundColor: '#5877B0' }}
                />
            </div>

            {/* Title and Description */}
            <h2 className="text-2xl font-semibold text-foreground mb-3 text-center">
                {isClient ? 'Aún no has creado solicitudes' : 'Sin solicitudes asignadas'}
            </h2>
            <p className="text-muted-foreground text-center max-w-md mb-8 leading-relaxed">
                {isClient
                    ? 'Explora nuestras categorías y encuentra el profesional perfecto para tu proyecto'
                    : 'Cuando los clientes te soliciten servicios, aparecerán aquí'}
            </p>

            {/* CTA Button */}
            {isClient && (
                <Button
                    size="lg"
                    onClick={() => navigate(ROUTES.DASHBOARD.CATEGORIES)}
                    style={{ backgroundColor: '#58A3B0' }}
                    className="text-white hover:bg-[#4A8A95] mb-12 gap-2 px-8"
                >
                    <Plus size={20} />
                    Explorar servicios
                </Button>
            )}

            {/* Popular Categories */}
            {isClient && (
                <div className="w-full max-w-3xl">
                    <h3 className="text-sm font-semibold text-muted-foreground uppercase tracking-wide mb-4 text-center">
                        Categorías populares
                    </h3>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        {popularCategories.map((category) => {
                            const Icon = category.icon;
                            return (
                                <Card
                                    key={category.id}
                                    className="p-5 cursor-pointer transition-all duration-200 hover:shadow-md hover:-translate-y-1 border-2 hover:border-primary/50"
                                    onClick={() => navigate(ROUTES.DASHBOARD.CATEGORIES)}
                                >
                                    <div className="flex flex-col items-center text-center">
                                        <div
                                            className="w-14 h-14 rounded-full flex items-center justify-center mb-3"
                                            style={{
                                                backgroundColor: `${category.color}15`,
                                            }}
                                        >
                                            <Icon size={28} style={{ color: category.color }} />
                                        </div>
                                        <h4 className="font-semibold text-foreground mb-1">
                                            {category.name}
                                        </h4>
                                        <p className="text-xs text-muted-foreground">
                                            {category.workers} trabajadores disponibles
                                        </p>
                                    </div>
                                </Card>
                            );
                        })}
                    </div>
                </div>
            )}
        </div>
    );
}
