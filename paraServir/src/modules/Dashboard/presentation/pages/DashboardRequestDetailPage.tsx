import { useEffect, useState, useMemo } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useSelector } from "react-redux";
import type { RootState } from "@/Store";
import { PageContainer } from "@/shared/components/layout/PageContainer";
import { PageHeader } from "@/shared/components/layout/PageHeader";
import { Card, CardContent, CardHeader, CardTitle } from "@/shared/components/ui/card";
import { Badge } from "@/shared/components/ui/badge";
import { Button } from "@/shared/components/ui/button";
import { Separator } from "@/shared/components/ui/separator";
import { LoadingState } from "@/shared/components/feedback/LoadingState";
import { Alert, AlertDescription } from "@/shared/components/ui/alert";
import { ServiceRequestController } from "@/modules/ServiceRequests/infra/http/controllers/service-request.controller";
import { ReviewController } from "@/modules/Reviews/infra/http/controllers/review.controller";
import { CreateReviewForm } from "@/modules/Reviews/presentation/components/CreateReviewForm";
import { ReviewCard } from "@/modules/Reviews/presentation/components/ReviewCard";
import { DeleteRequestModal } from "@/modules/ServiceRequests/presentation/components/DeleteRequestModal";
import type { ServiceRequestDto } from "@/modules/ServiceRequests/application/dto/service-request.dto";
import type { ReviewDto } from "@/modules/Reviews/application/dto/review.dto";
import { useAuth } from "@/shared/hooks/useAuth";
import { isClient, isWorker } from "@/shared/constants/user-roles.constants";
import { 
  Calendar, 
  MapPin, 
  User, 
  Briefcase, 
  FileText, 
  AlertCircle,
  ArrowLeft,
  CheckCircle2,
  XCircle,
  Clock,
  Loader2,
  MessageSquare
} from "lucide-react";
import { format } from "date-fns";
import { es } from "date-fns/locale";
import { ROUTES } from "@/shared/constants/routes.constants";

const statusConfig = {
  pending: { label: "Pendiente", variant: "secondary" as const, icon: Clock },
  accepted: { label: "Aceptada", variant: "default" as const, icon: CheckCircle2 },
  in_progress: { label: "En Progreso", variant: "default" as const, icon: Loader2 },
  completed: { label: "Completada", variant: "default" as const, icon: CheckCircle2 },
  cancelled: { label: "Cancelada", variant: "destructive" as const, icon: XCircle },
};

export function DashboardRequestDetailPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const user = useSelector((state: RootState) => state.auth.user);
  const role = user?.role;
  const { getToken } = useAuth();
  
  const [request, setRequest] = useState<ServiceRequestDto | null>(null);
  const [review, setReview] = useState<ReviewDto | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showReviewForm, setShowReviewForm] = useState(false);
  const [updatingStatus, setUpdatingStatus] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [deleting, setDeleting] = useState(false);

  const requestController = useMemo(() => new ServiceRequestController(), []);
  const reviewController = useMemo(() => new ReviewController(), []);

  useEffect(() => {
    const loadData = async () => {
      if (!id) {
        setError("ID de solicitud no válido");
        setLoading(false);
        return;
      }

      setLoading(true);
      setError(null);

      try {
        const token = getToken();
        if (!token) {
          setError("Sesión expirada. Inicia sesión nuevamente.");
          return;
        }

        // Cargar solicitud
        const requestData = await requestController.getDetail(id, token);
        setRequest(requestData);

        // Cargar reseña si existe
        try {
          const reviewData = await reviewController.getRequestReview(id);
          setReview(reviewData);
        } catch {
          // No hay reseña, es normal
          setReview(null);
        }
      } catch (err) {
        const errorMessage = err instanceof Error ? err.message : "Error al cargar la solicitud";
        setError(errorMessage);
      } finally {
        setLoading(false);
      }
    };

    void loadData();
  }, [id, requestController, reviewController, getToken]);

  const handleStatusUpdate = async (newStatus: ServiceRequestDto["status"]) => {
    if (!request || !id) return;

    setUpdatingStatus(true);
    setError(null);
    try {
      const token = getToken();
      if (!token) {
        setError("Sesión expirada. Por favor inicia sesión nuevamente.");
        setUpdatingStatus(false);
        return;
      }

      await requestController.update(id, { status: newStatus }, token);
      
      // Recargar datos para reflejar cambios
      const updatedRequest = await requestController.getDetail(id, token);
      setRequest(updatedRequest);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : "Error al actualizar estado";
      setError(errorMessage);
    } finally {
      setUpdatingStatus(false);
    }
  };

  const handleReviewSuccess = async () => {
    if (!id) return;
    
    try {
      const reviewData = await reviewController.getRequestReview(id);
      setReview(reviewData);
    } catch {
      // No hay reseña aún
    }
  };

  const handleDelete = async () => {
    if (!id) return;

    setDeleting(true);
    setError(null);

    try {
      const token = getToken();
      if (!token) {
        setError("Sesión expirada");
        return;
      }

      await requestController.delete(id, token);
      
      // Redirigir a la lista de solicitudes
      navigate(ROUTES.DASHBOARD.REQUESTS);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : "Error al eliminar la solicitud";
      setError(errorMessage);
    } finally {
      setDeleting(false);
    }
  };

  if (loading) {
    return (
      <PageContainer>
        <PageHeader title="Detalle de Solicitud" />
        <LoadingState message="Cargando detalles de la solicitud..." variant="list" count={3} />
      </PageContainer>
    );
  }

  if (error || !request) {
    return (
      <PageContainer>
        <PageHeader title="Detalle de Solicitud" />
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>{error || "Solicitud no encontrada"}</AlertDescription>
        </Alert>
        <Button onClick={() => navigate(ROUTES.DASHBOARD.REQUESTS)} variant="outline" className="mt-4">
          <ArrowLeft className="mr-2 h-4 w-4" />
          Volver a Solicitudes
        </Button>
      </PageContainer>
    );
  }

  const StatusIcon = statusConfig[request.status].icon;
  const formattedDate = request.scheduled_date 
    ? format(new Date(request.scheduled_date), "dd 'de' MMMM, yyyy 'a las' HH:mm", { locale: es })
    : "No programada";
  const createdDate = request.created_at
    ? format(new Date(request.created_at), "dd 'de' MMMM, yyyy", { locale: es })
    : "";

  const canCreateReview = 
    isClient(role) && 
    request.status === "completed" && 
    !review;

  const canAccept = 
    isWorker(role) && 
    request.status === "pending";

  const canCancel = 
    (isClient(role) && request.status === "pending") ||
    (isWorker(role) && ["pending", "accepted"].includes(request.status));

  const canDelete = 
    (isClient(role) && ["pending", "cancelled"].includes(request.status)) ||
    (isWorker(role) && ["pending", "cancelled"].includes(request.status));

  const canChat = 
    request.worker_id && 
    ["accepted", "in_progress", "completed"].includes(request.status);

  return (
    <PageContainer>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <PageHeader 
            title="Detalle de Solicitud" 
            description={`Solicitud #${request.id.slice(0, 8)}`}
          />
          <Button onClick={() => navigate(ROUTES.DASHBOARD.REQUESTS)} variant="outline">
            <ArrowLeft className="mr-2 h-4 w-4" />
            Volver
          </Button>
        </div>

        {/* Estado y acciones */}
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <StatusIcon className="h-5 w-5" />
                <CardTitle>Estado</CardTitle>
              </div>
              <Badge variant={statusConfig[request.status].variant}>
                {statusConfig[request.status].label}
              </Badge>
            </div>
          </CardHeader>
          <CardContent>
            <div className="flex flex-wrap gap-2">
              {canChat && (
                <Button
                  onClick={() => navigate(`${ROUTES.DASHBOARD.CHATS}?requestId=${request.id}`)}
                  variant="outline"
                  size="sm"
                >
                  <MessageSquare className="mr-2 h-4 w-4" />
                  Ir al Chat
                </Button>
              )}
              {canAccept && (
                <Button
                  onClick={() => handleStatusUpdate("accepted")}
                  disabled={updatingStatus}
                  size="sm"
                >
                  {updatingStatus ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Procesando...
                    </>
                  ) : (
                    "Aceptar Solicitud"
                  )}
                </Button>
              )}
              {canCancel && (
                <Button
                  onClick={() => handleStatusUpdate("cancelled")}
                  disabled={updatingStatus}
                  variant="destructive"
                  size="sm"
                >
                  Cancelar
                </Button>
              )}
              {canDelete && (
                <Button
                  onClick={() => setShowDeleteModal(true)}
                  disabled={updatingStatus}
                  variant="destructive"
                  size="sm"
                >
                  Eliminar
                </Button>
              )}
              {isWorker(role) && request.status === "accepted" && (
                <Button
                  onClick={() => handleStatusUpdate("in_progress")}
                  disabled={updatingStatus}
                  size="sm"
                >
                  Iniciar Trabajo
                </Button>
              )}
              {isWorker(role) && request.status === "in_progress" && (
                <Button
                  onClick={() => handleStatusUpdate("completed")}
                  disabled={updatingStatus}
                  size="sm"
                >
                  Marcar como Completada
                </Button>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Información principal */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <Card>
            <CardHeader>
              <CardTitle>Información del Servicio</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-start gap-3">
                <FileText className="h-5 w-5 text-muted-foreground mt-0.5" />
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Descripción</p>
                  <p className="text-sm">{request.description}</p>
                </div>
              </div>
              
              {request.category_name && (
                <div className="flex items-start gap-3">
                  <Briefcase className="h-5 w-5 text-muted-foreground mt-0.5" />
                  <div>
                    <p className="text-sm font-medium text-muted-foreground">Categoría</p>
                    <p className="text-sm">{request.category_name}</p>
                  </div>
                </div>
              )}

              {request.service_title && (
                <div className="flex items-start gap-3">
                  <Briefcase className="h-5 w-5 text-muted-foreground mt-0.5" />
                  <div>
                    <p className="text-sm font-medium text-muted-foreground">Servicio</p>
                    <p className="text-sm">{request.service_title}</p>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Detalles</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-start gap-3">
                <MapPin className="h-5 w-5 text-muted-foreground mt-0.5" />
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Dirección</p>
                  <p className="text-sm">{request.address}</p>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <Calendar className="h-5 w-5 text-muted-foreground mt-0.5" />
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Fecha Programada</p>
                  <p className="text-sm">{formattedDate}</p>
                </div>
              </div>

              {createdDate && (
                <div className="flex items-start gap-3">
                  <Calendar className="h-5 w-5 text-muted-foreground mt-0.5" />
                  <div>
                    <p className="text-sm font-medium text-muted-foreground">Creada</p>
                    <p className="text-sm">{createdDate}</p>
                  </div>
                </div>
              )}

              {request.worker_name && (
                <div className="flex items-start gap-3">
                  <User className="h-5 w-5 text-muted-foreground mt-0.5" />
                  <div>
                    <p className="text-sm font-medium text-muted-foreground">Trabajador</p>
                    <p className="text-sm">{request.worker_name}</p>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Reseña */}
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle>Reseña</CardTitle>
              {canCreateReview && (
                <Button onClick={() => setShowReviewForm(true)} size="sm">
                  Crear Reseña
                </Button>
              )}
            </div>
          </CardHeader>
          <CardContent>
            {review ? (
              <ReviewCard review={review} />
            ) : request.status === "completed" ? (
              <p className="text-sm text-muted-foreground">
                {isClient(role) 
                  ? "Aún no has creado una reseña para este servicio."
                  : "El cliente aún no ha creado una reseña."}
              </p>
            ) : (
              <p className="text-sm text-muted-foreground">
                Las reseñas solo están disponibles para servicios completados.
              </p>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Dialog para crear reseña */}
      {id && (
        <CreateReviewForm
          requestId={id}
          open={showReviewForm}
          onOpenChange={setShowReviewForm}
          onSuccess={handleReviewSuccess}
        />
      )}

      {/* Modal para eliminar solicitud */}
      <DeleteRequestModal
        open={showDeleteModal}
        onOpenChange={setShowDeleteModal}
        onConfirm={handleDelete}
        loading={deleting}
      />
    </PageContainer>
  );
}

