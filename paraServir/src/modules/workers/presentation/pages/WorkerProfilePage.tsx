import { useEffect, useState, useMemo } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { PageContainer } from "@/shared/components/layout/PageContainer";
import { PageHeader } from "@/shared/components/layout/PageHeader";
import { Card, CardContent, CardHeader, CardTitle } from "@/shared/components/ui/card";
import { Badge } from "@/shared/components/ui/badge";
import { Button } from "@/shared/components/ui/button";
import { Avatar, AvatarImage, AvatarFallback } from "@/shared/components/ui/avatar";
import { Separator } from "@/shared/components/ui/separator";
import { LoadingState } from "@/shared/components/feedback/LoadingState";
import { Alert, AlertDescription } from "@/shared/components/ui/alert";
import { GetWorkerProfileUseCase } from "../../application/use-cases/get-worker-profile.use-case";
import { ServiceController } from "@/modules/Services/infra/http/controllers/service.controller";
import { ReviewController } from "@/modules/Reviews/infra/http/controllers/review.controller";
import { WorkerReviewsList } from "@/modules/Reviews/presentation/components/WorkerReviewsList";
import type { WorkerProfileDto } from "../../application/dto/worker-profile.dto";
import type { WorkerServiceDto } from "@/modules/Services/application/dto/worker-service.dto";
import { 
  MapPin, 
  Phone, 
  Mail, 
  Briefcase, 
  Calendar,
  CheckCircle2,
  XCircle,
  AlertCircle,
  MessageSquare,
  ArrowLeft
} from "lucide-react";
import { ROUTES } from "@/shared/constants/routes.constants";
import { useAuth } from "@/shared/hooks/useAuth";
import { useSelector } from "react-redux";
import type { RootState } from "@/Store";
import { isClient } from "@/shared/constants/user-roles.constants";

export function WorkerProfilePage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { getToken } = useAuth();
  const user = useSelector((state: RootState) => state.auth.user);
  const role = user?.role;

  const [worker, setWorker] = useState<WorkerProfileDto | null>(null);
  const [services, setServices] = useState<WorkerServiceDto[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const workerUseCase = useMemo(() => new GetWorkerProfileUseCase(), []);
  const serviceController = useMemo(() => new ServiceController(), []);
  const reviewController = useMemo(() => new ReviewController(), []);

  useEffect(() => {
    const loadData = async () => {
      if (!id) {
        setError("ID de trabajador no válido");
        setLoading(false);
        return;
      }

      setLoading(true);
      setError(null);

      try {
        // Cargar perfil del trabajador (público)
        const workerData = await workerUseCase.execute(id);
        setWorker(workerData);

        // Cargar servicios (requiere token si está autenticado, pero puede funcionar sin él)
        try {
          const token = getToken();
          const servicesData = await serviceController.getWorkerServices(id, token || "");
          setServices(servicesData);
        } catch {
          // Si falla, continuar sin servicios
          setServices([]);
        }
      } catch (err) {
        const errorMessage = err instanceof Error ? err.message : "Error al cargar el perfil";
        setError(errorMessage);
      } finally {
        setLoading(false);
      }
    };

    void loadData();
  }, [id, workerUseCase, serviceController, getToken]);

  const handleCreateRequest = (serviceId?: string, categoryId?: string) => {
    if (!isClient(role)) {
      navigate(ROUTES.PUBLIC.LOGIN);
      return;
    }

    // Navegar a crear solicitud con parámetros
    const params = new URLSearchParams();
    if (serviceId) params.set("serviceId", serviceId);
    if (categoryId) params.set("categoryId", categoryId);
    if (id) params.set("workerId", id);

    navigate(`${ROUTES.DASHBOARD.REQUESTS_NEW}?${params.toString()}`);
  };

  if (loading) {
    return (
      <PageContainer>
        <PageHeader title="Perfil de Trabajador" />
        <LoadingState message="Cargando perfil del trabajador..." variant="list" count={3} />
      </PageContainer>
    );
  }

  if (error || !worker) {
    return (
      <PageContainer>
        <PageHeader title="Perfil de Trabajador" />
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>{error || "Trabajador no encontrado"}</AlertDescription>
        </Alert>
        <Button onClick={() => navigate(ROUTES.PUBLIC.HOME)} variant="outline" className="mt-4">
          <ArrowLeft className="mr-2 h-4 w-4" />
          Volver al Inicio
        </Button>
      </PageContainer>
    );
  }

  const fullName = `${worker.first_name} ${worker.last_name}`;
  const initials = `${worker.first_name[0]}${worker.last_name[0]}`.toUpperCase();

  return (
    <PageContainer>
      <div className="space-y-6">
        <Button onClick={() => navigate(-1)} variant="outline" size="sm">
          <ArrowLeft className="mr-2 h-4 w-4" />
          Volver
        </Button>

        {/* Información del trabajador */}
        <Card>
          <CardHeader>
            <div className="flex items-start gap-4">
              <Avatar className="h-20 w-20">
                <AvatarImage src={worker.avatar_url || undefined} alt={fullName} />
                <AvatarFallback className="text-lg">{initials}</AvatarFallback>
              </Avatar>
              <div className="flex-1">
                <div className="flex items-center gap-3 mb-2">
                  <CardTitle className="text-2xl">{fullName}</CardTitle>
                  {worker.verification_status === "verified" && (
                    <Badge variant="default" className="gap-1">
                      <CheckCircle2 className="h-3 w-3" />
                      Verificado
                    </Badge>
                  )}
                  {!worker.is_active && (
                    <Badge variant="secondary">Inactivo</Badge>
                  )}
                </div>
                <div className="flex flex-wrap gap-4 text-sm text-muted-foreground">
                  {worker.location && (
                    <div className="flex items-center gap-1">
                      <MapPin className="h-4 w-4" />
                      {worker.location}
                    </div>
                  )}
                  {worker.phone && (
                    <div className="flex items-center gap-1">
                      <Phone className="h-4 w-4" />
                      {worker.phone}
                    </div>
                  )}
                  {worker.years_experience && (
                    <div className="flex items-center gap-1">
                      <Calendar className="h-4 w-4" />
                      {worker.years_experience} años de experiencia
                    </div>
                  )}
                </div>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            {worker.certification_url && (
              <div className="mt-4">
                <a
                  href={worker.certification_url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-sm text-primary hover:underline"
                >
                  Ver certificaciones →
                </a>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Servicios */}
        <Card>
          <CardHeader>
            <CardTitle>Servicios Ofrecidos</CardTitle>
          </CardHeader>
          <CardContent>
            {services.length === 0 ? (
              <p className="text-sm text-muted-foreground">Este trabajador aún no tiene servicios publicados.</p>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {services.map((service) => (
                  <Card key={service.id} className="p-4">
                    <div className="space-y-2">
                      <div className="flex items-start justify-between">
                        <div>
                          <h4 className="font-semibold">{service.title}</h4>
                          <p className="text-xs text-muted-foreground">{service.category_name}</p>
                        </div>
                        <Badge variant={service.is_available ? "default" : "secondary"}>
                          {service.is_available ? "Disponible" : "No disponible"}
                        </Badge>
                      </div>
                      <p className="text-sm text-muted-foreground line-clamp-2">{service.description}</p>
                      <div className="flex items-center justify-between">
                        <span className="text-sm font-semibold text-primary">
                          ${Number(service.base_price).toFixed(2)}
                        </span>
                        {isClient(role) && service.is_available && (
                          <Button
                            size="sm"
                            onClick={() => handleCreateRequest(service.id, service.category_id)}
                          >
                            <MessageSquare className="mr-2 h-4 w-4" />
                            Solicitar
                          </Button>
                        )}
                      </div>
                    </div>
                  </Card>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Reseñas */}
        <Card>
          <CardHeader>
            <CardTitle>Reseñas</CardTitle>
          </CardHeader>
          <CardContent>
            <WorkerReviewsList workerId={id!} showAverage={true} />
          </CardContent>
        </Card>
      </div>
    </PageContainer>
  );
}

