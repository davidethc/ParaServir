import { Card } from '@/shared/components/ui/card';
import { Badge } from '@/shared/components/ui/badge';
import { Button } from '@/shared/components/ui/button';
import {
    Calendar,
    MapPin,
    Clock,
    DollarSign,
    Star,
    MessageCircle,
    MoreVertical,
} from 'lucide-react';
import { Avatar, AvatarImage, AvatarFallback } from '@/shared/components/ui/avatar';
import type { ServiceRequestDto } from '@/modules/ServiceRequests/application/dto/service-request.dto';
import { format } from 'date-fns';
import { es } from 'date-fns/locale';
import { getUserAvatar } from '@/shared/Utils/avatar-utils';

interface RequestCardProps {
    request: ServiceRequestDto;
    role?: string;
    onViewDetails: () => void;
    onUpdateStatus?: (status: ServiceRequestDto['status']) => void;
    onAction?: (action: string) => void;
}

const statusConfig = {
    pending: {
        label: 'Pendiente',
        bg: '#FEF3C7',
        text: '#D97706',
        border: '#FCD34D',
    },
    accepted: {
        label: 'Aceptada',
        bg: '#DBEAFE',
        text: '#1D4ED8',
        border: '#93C5FD',
    },
    in_progress: {
        label: 'En progreso',
        bg: '#EDE9FE',
        text: '#6D28D9',
        border: '#C4B5FD',
    },
    completed: {
        label: 'Completada',
        bg: '#D1FAE5',
        text: '#047857',
        border: '#6EE7B7',
    },
    cancelled: {
        label: 'Cancelada',
        bg: '#F3F4F6',
        text: '#4B5563',
        border: '#D1D5DB',
    },
};

export function RequestCard({
    request,
    role,
    onViewDetails,
    onUpdateStatus,
    onAction,
}: RequestCardProps) {
    const status = statusConfig[request.status];
    const isClient = role === 'client';
    const workerName = request.worker_name || 'Sin asignar';
    const workerInitials = workerName
        .split(' ')
        .map((n) => n[0])
        .slice(0, 2)
        .join('')
        .toUpperCase();

    const avatarUrl = getUserAvatar(
        request.worker_id || '',
        undefined,
        request.worker_name || ''
    );

    const formattedDate = format(new Date(request.scheduled_date), "dd/MM/yyyy, HH:mm", {
        locale: es,
    });

    const handleCardClick = (e: React.MouseEvent) => {
        // Don't trigger if clicking on buttons
        if ((e.target as HTMLElement).closest('button')) {
            return;
        }
        onViewDetails();
    };

    const renderActions = () => {
        if (request.status === 'pending') {
            if (isClient) {
                return (
                    <>
                        <Button
                            variant="outline"
                            size="sm"
                            onClick={onViewDetails}
                            className="border-primary text-primary hover:bg-primary/10"
                        >
                            Ver detalles
                        </Button>
                        <Button
                            variant="outline"
                            size="sm"
                            onClick={() => onUpdateStatus?.('cancelled')}
                            className="border-destructive text-destructive hover:bg-destructive/10"
                        >
                            Cancelar
                        </Button>
                    </>
                );
            } else {
                return (
                    <>
                        <Button
                            size="sm"
                            onClick={() => onUpdateStatus?.('accepted')}
                            style={{ backgroundColor: '#58A3B0' }}
                            className="text-white hover:bg-[#4A8A95]"
                        >
                            Aceptar
                        </Button>
                        <Button
                            variant="outline"
                            size="sm"
                            onClick={() => onUpdateStatus?.('cancelled')}
                            className="border-destructive text-destructive hover:bg-destructive/10"
                        >
                            Rechazar
                        </Button>
                    </>
                );
            }
        }

        if (request.status === 'accepted') {
            return (
                <>
                    <Button
                        size="sm"
                        onClick={() => onAction?.('contact')}
                        style={{ backgroundColor: '#58A3B0' }}
                        className="text-white hover:bg-[#4A8A95] gap-2"
                    >
                        <MessageCircle size={16} />
                        Contactar
                    </Button>
                    <Button variant="outline" size="sm" onClick={onViewDetails}>
                        Ver detalles
                    </Button>
                </>
            );
        }

        if (request.status === 'in_progress') {
            return (
                <>
                    <Button
                        size="sm"
                        onClick={() => onAction?.('chat')}
                        style={{ backgroundColor: '#58A3B0' }}
                        className="text-white hover:bg-[#4A8A95] gap-2"
                    >
                        <MessageCircle size={16} />
                        Abrir chat
                    </Button>
                    <Button variant="outline" size="sm" onClick={onViewDetails}>
                        Ver detalles
                    </Button>
                </>
            );
        }

        if (request.status === 'completed') {
            return (
                <>
                    <Button
                        size="sm"
                        onClick={() => onAction?.('rate')}
                        style={{ backgroundColor: '#10B981' }}
                        className="text-white hover:bg-[#059669]"
                    >
                        Calificar servicio
                    </Button>
                    <Button variant="outline" size="sm" onClick={() => onAction?.('rebook')}>
                        Contratar nuevamente
                    </Button>
                </>
            );
        }

        if (request.status === 'cancelled') {
            return (
                <>
                    <Button variant="outline" size="sm" onClick={onViewDetails}>
                        Ver razón
                    </Button>
                    <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => onAction?.('delete')}
                        className="text-muted-foreground"
                    >
                        Eliminar
                    </Button>
                </>
            );
        }

        return (
            <Button variant="outline" size="sm" onClick={onViewDetails}>
                Ver detalles
            </Button>
        );
    };

    return (
        <Card
            className="p-5 transition-all duration-300 hover:shadow-md hover:-translate-y-0.5 cursor-pointer border border-border"
            onClick={handleCardClick}
        >
            {/* Header */}
            <div className="flex items-start justify-between mb-4">
                <div className="flex gap-3 items-start flex-1">
                    <Avatar className="h-12 w-12 border-2 border-muted">
                        <AvatarImage src={avatarUrl} alt={workerName} />
                        <AvatarFallback className="text-sm font-semibold">
                            {workerInitials}
                        </AvatarFallback>
                    </Avatar>

                    <div className="flex-1 min-w-0">
                        <h4 className="font-semibold text-foreground text-base leading-tight">
                            {workerName}
                        </h4>
                        <div className="flex items-center gap-1 mt-1">
                            <Star size={14} fill="#F59E0B" color="#F59E0B" />
                            <span className="text-xs text-muted-foreground font-medium">4.8</span>
                        </div>
                    </div>
                </div>

                <Badge
                    className="shrink-0 font-semibold text-xs px-3 py-1.5"
                    style={{
                        backgroundColor: status.bg,
                        color: status.text,
                        border: `1.5px solid ${status.border}`,
                    }}
                >
                    {status.label}
                </Badge>
            </div>

            {/* Body */}
            <div className="mb-4">
                <p className="text-xs text-muted-foreground mb-1">
                    {request.category_name || 'Categoría'}
                </p>
                <h3 className="text-lg font-bold text-foreground mb-2 leading-tight">
                    {request.service_title || 'Solicitud de servicio'}
                </h3>
                <p className="text-sm text-muted-foreground line-clamp-2 leading-relaxed">
                    {request.description}
                </p>
            </div>

            {/* Info Grid */}
            <div className="grid grid-cols-2 gap-3 mb-4 text-sm">
                <div className="flex items-center gap-2">
                    <Calendar size={16} style={{ color: '#58A3B0' }} />
                    <span className="text-foreground/70 truncate">{formattedDate}</span>
                </div>

                <div className="flex items-center gap-2">
                    <MapPin size={16} style={{ color: '#58A3B0' }} />
                    <span className="text-foreground/70 truncate">{request.address}</span>
                </div>

                <div className="flex items-center gap-2">
                    <Clock size={16} style={{ color: '#58A3B0' }} />
                    <span className="text-foreground/70">2 horas estimadas</span>
                </div>

                <div className="flex items-center gap-2">
                    <DollarSign size={16} style={{ color: '#58A3B0' }} />
                    <span className="text-foreground/70">Por cotizar</span>
                </div>
            </div>

            {/* Timeline for in_progress status */}
            {request.status === 'in_progress' && (
                <div className="mb-4 pt-4 border-t border-border">
                    <div className="flex items-center justify-between text-xs">
                        <div className="flex items-center gap-2">
                            <div
                                className="w-2 h-2 rounded-full"
                                style={{ backgroundColor: '#10B981' }}
                            />
                            <span className="text-muted-foreground">Creada</span>
                        </div>
                        <div className="flex-1 h-0.5 mx-2 bg-linear-to-r from-green-500 to-primary" />
                        <div className="flex items-center gap-2">
                            <div
                                className="w-2 h-2 rounded-full"
                                style={{ backgroundColor: '#10B981' }}
                            />
                            <span className="text-muted-foreground">Aceptada</span>
                        </div>
                        <div className="flex-1 h-0.5 mx-2 bg-linear-to-r from-primary to-muted" />
                        <div className="flex items-center gap-2">
                            <div
                                className="w-2 h-2 rounded-full animate-pulse"
                                style={{ backgroundColor: '#58A3B0' }}
                            />
                            <span className="font-medium text-primary">En progreso</span>
                        </div>
                        <div className="flex-1 h-0.5 mx-2 bg-muted" />
                        <div className="flex items-center gap-2">
                            <div className="w-2 h-2 rounded-full bg-muted" />
                            <span className="text-muted-foreground">Completada</span>
                        </div>
                    </div>
                </div>
            )}

            {/* Footer */}
            <div
                className="flex items-center justify-between gap-3 pt-4 border-t border-border"
                onClick={(e) => e.stopPropagation()}
            >
                <div className="flex gap-2 flex-wrap flex-1">{renderActions()}</div>

                <button
                    onClick={(e) => {
                        e.stopPropagation();
                        onAction?.('menu');
                    }}
                    className="p-2 hover:bg-muted rounded-md transition-colors text-muted-foreground hover:text-foreground"
                >
                    <MoreVertical size={18} />
                </button>
            </div>
        </Card>
    );
}
