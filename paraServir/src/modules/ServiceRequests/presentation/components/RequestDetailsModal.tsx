import { X, Calendar, MapPin, Clock, DollarSign, Phone, MessageCircle, ExternalLink } from 'lucide-react';
import { Dialog, DialogContent } from '@/shared/components/ui/dialog';
import { Button } from '@/shared/components/ui/button';
import { Badge } from '@/shared/components/ui/badge';
import { Avatar, AvatarImage, AvatarFallback } from '@/shared/components/ui/avatar';
import type { ServiceRequestDto } from '@/modules/ServiceRequests/application/dto/service-request.dto';
import { format } from 'date-fns';
import { es } from 'date-fns/locale';
import { getUserAvatar } from '@/shared/Utils/avatar-utils';

interface RequestDetailsModalProps {
    request: ServiceRequestDto | null;
    isOpen: boolean;
    onClose: () => void;
    role?: string;
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

export function RequestDetailsModal({
    request,
    isOpen,
    onClose,
}: RequestDetailsModalProps) {
    if (!request) return null;

    const status = statusConfig[request.status];
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

    const formattedDate = format(new Date(request.scheduled_date), "dd 'de' MMMM, yyyy 'a las' HH:mm", {
        locale: es,
    });

    const createdDate = request.created_at
        ? format(new Date(request.created_at), "dd/MM/yyyy HH:mm", { locale: es })
        : 'N/A';

    return (
        <Dialog open={isOpen} onOpenChange={onClose}>
            <DialogContent className="max-w-3xl max-h-[90vh] p-0 overflow-hidden">
                {/* Header with Gradient */}
                <div
                    className="px-6 py-6 text-white relative"
                    style={{
                        background: 'linear-gradient(to right, #58A3B0, #5877B0)',
                    }}
                >
                    <button
                        onClick={onClose}
                        className="absolute top-4 right-4 p-2 hover:bg-white/20 rounded-full transition-colors"
                    >
                        <X size={20} />
                    </button>

                    <div className="flex items-start justify-between mb-3">
                        <div className="flex-1">
                            <p className="text-sm opacity-90 mb-1">{request.category_name}</p>
                            <h2 className="text-2xl font-bold leading-tight mb-2">
                                {request.service_title || 'Solicitud de servicio'}
                            </h2>
                        </div>
                        <Badge
                            className="shrink-0 font-semibold px-4 py-1.5"
                            style={{
                                backgroundColor: status.bg,
                                color: status.text,
                                border: `1.5px solid ${status.border}`,
                            }}
                        >
                            {status.label}
                        </Badge>
                    </div>
                </div>

                {/* Body */}
                <div className="px-6 py-6 overflow-y-auto max-h-[calc(90vh-200px)]">
                    {/* Worker Information */}
                    <div className="mb-6 pb-6 border-b border-border">
                        <h3 className="text-sm font-semibold text-muted-foreground uppercase mb-4">
                            Información del trabajador
                        </h3>
                        <div className="flex items-start gap-4">
                            <Avatar className="h-20 w-20 border-2 border-muted">
                                <AvatarImage src={avatarUrl} alt={workerName} />
                                <AvatarFallback className="text-lg font-semibold">
                                    {workerInitials}
                                </AvatarFallback>
                            </Avatar>

                            <div className="flex-1">
                                <div className="flex items-center gap-2 mb-2">
                                    <h4 className="text-lg font-semibold text-foreground">{workerName}</h4>
                                    <Badge variant="secondary" className="text-xs">Verificado</Badge>
                                </div>
                                <p className="text-sm text-muted-foreground mb-3">
                                    Calificación: ⭐ 4.8 (23 reseñas)
                                </p>
                                <div className="flex gap-2">
                                    <Button size="sm" variant="outline" className="gap-2">
                                        <MessageCircle size={16} />
                                        Enviar mensaje
                                    </Button>
                                    <Button size="sm" variant="outline" className="gap-2">
                                        <Phone size={16} />
                                        Llamar
                                    </Button>
                                    <Button size="sm" variant="outline" className="gap-2">
                                        <ExternalLink size={16} />
                                        Ver perfil
                                    </Button>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Service Details */}
                    <div className="mb-6 pb-6 border-b border-border">
                        <h3 className="text-sm font-semibold text-muted-foreground uppercase mb-4">
                            Detalles del servicio
                        </h3>

                        <div className="space-y-4">
                            <div>
                                <p className="text-sm font-medium text-foreground mb-1">Descripción</p>
                                <p className="text-sm text-muted-foreground leading-relaxed">
                                    {request.description}
                                </p>
                            </div>

                            <div className="grid grid-cols-2 gap-4">
                                <div className="flex items-start gap-3">
                                    <Calendar size={18} style={{ color: '#58A3B0' }} className="mt-0.5" />
                                    <div>
                                        <p className="text-xs text-muted-foreground mb-0.5">Fecha programada</p>
                                        <p className="text-sm font-medium text-foreground">{formattedDate}</p>
                                    </div>
                                </div>

                                <div className="flex items-start gap-3">
                                    <MapPin size={18} style={{ color: '#58A3B0' }} className="mt-0.5" />
                                    <div>
                                        <p className="text-xs text-muted-foreground mb-0.5">Ubicación</p>
                                        <p className="text-sm font-medium text-foreground">{request.address}</p>
                                    </div>
                                </div>

                                <div className="flex items-start gap-3">
                                    <Clock size={18} style={{ color: '#58A3B0' }} className="mt-0.5" />
                                    <div>
                                        <p className="text-xs text-muted-foreground mb-0.5">Duración estimada</p>
                                        <p className="text-sm font-medium text-foreground">2 horas</p>
                                    </div>
                                </div>

                                <div className="flex items-start gap-3">
                                    <DollarSign size={18} style={{ color: '#58A3B0' }} className="mt-0.5" />
                                    <div>
                                        <p className="text-xs text-muted-foreground mb-0.5">Precio</p>
                                        <p className="text-sm font-medium text-foreground">Por cotizar</p>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Timeline */}
                    <div className="mb-6">
                        <h3 className="text-sm font-semibold text-muted-foreground uppercase mb-4">
                            Historial de la solicitud
                        </h3>

                        <div className="space-y-4">
                            <div className="flex gap-3">
                                <div className="flex flex-col items-center">
                                    <div
                                        className="w-3 h-3 rounded-full"
                                        style={{ backgroundColor: '#10B981' }}
                                    />
                                    <div className="w-0.5 h-full bg-border mt-1" />
                                </div>
                                <div className="flex-1 pb-4">
                                    <p className="text-sm font-medium text-foreground mb-0.5">
                                        Solicitud creada
                                    </p>
                                    <p className="text-xs text-muted-foreground">{createdDate}</p>
                                </div>
                            </div>

                            {request.status !== 'pending' && (
                                <div className="flex gap-3">
                                    <div className="flex flex-col items-center">
                                        <div
                                            className="w-3 h-3 rounded-full"
                                            style={{ backgroundColor: '#10B981' }}
                                        />
                                        {request.status !== 'accepted' && (
                                            <div className="w-0.5 h-full bg-border mt-1" />
                                        )}
                                    </div>
                                    <div className="flex-1 pb-4">
                                        <p className="text-sm font-medium text-foreground mb-0.5">
                                            {request.status === 'cancelled' ? 'Cancelada' : 'Aceptada por el trabajador'}
                                        </p>
                                        <p className="text-xs text-muted-foreground">
                                            {request.updated_at
                                                ? format(new Date(request.updated_at), "dd/MM/yyyy HH:mm", { locale: es })
                                                : 'N/A'}
                                        </p>
                                    </div>
                                </div>
                            )}

                            {(request.status === 'in_progress' || request.status === 'completed') && (
                                <div className="flex gap-3">
                                    <div className="flex flex-col items-center">
                                        <div
                                            className="w-3 h-3 rounded-full"
                                            style={{
                                                backgroundColor: request.status === 'in_progress' ? '#58A3B0' : '#10B981'
                                            }}
                                        />
                                        {request.status === 'in_progress' && (
                                            <div className="w-0.5 h-full bg-muted mt-1" />
                                        )}
                                    </div>
                                    <div className="flex-1">
                                        <p className="text-sm font-medium text-foreground mb-0.5">
                                            Servicio en progreso
                                        </p>
                                        <p className="text-xs text-muted-foreground">En curso</p>
                                    </div>
                                </div>
                            )}

                            {request.status === 'completed' && (
                                <div className="flex gap-3">
                                    <div className="flex flex-col items-center">
                                        <div
                                            className="w-3 h-3 rounded-full"
                                            style={{ backgroundColor: '#10B981' }}
                                        />
                                    </div>
                                    <div className="flex-1">
                                        <p className="text-sm font-medium text-foreground mb-0.5">
                                            Servicio completado
                                        </p>
                                        <p className="text-xs text-muted-foreground">Finalizado</p>
                                    </div>
                                </div>
                            )}
                        </div>
                    </div>
                </div>

                {/* Footer */}
                <div className="px-6 py-4 border-t border-border bg-muted/30 flex justify-end gap-2">
                    <Button variant="outline" onClick={onClose}>
                        Cerrar
                    </Button>
                    {request.status === 'pending' && (
                        <Button
                            style={{ backgroundColor: '#EF4444' }}
                            className="text-white hover:bg-[#DC2626]"
                        >
                            Cancelar solicitud
                        </Button>
                    )}
                    {request.status === 'accepted' && (
                        <Button
                            style={{ backgroundColor: '#58A3B0' }}
                            className="text-white hover:bg-[#4A8A95]"
                        >
                            Contactar trabajador
                        </Button>
                    )}
                    {request.status === 'completed' && (
                        <Button
                            style={{ backgroundColor: '#10B981' }}
                            className="text-white hover:bg-[#059669]"
                        >
                            Calificar servicio
                        </Button>
                    )}
                </div>
            </DialogContent>
        </Dialog>
    );
}
