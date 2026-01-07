import { useEffect, useMemo, useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { useSelector } from "react-redux";
import type { RootState } from "@/Store";
import { PageContainer } from "@/shared/components/layout/PageContainer";
import { Button } from "@/shared/components/ui/button";
import { Card } from "@/shared/components/ui/card";
import { Badge } from "@/shared/components/ui/badge";
import { ROUTES } from "@/shared/constants/routes.constants";
import { ServiceController } from "@/modules/Services/infra/http/controllers/service.controller";
import type { WorkerServiceDto } from "@/modules/Services/application/dto/worker-service.dto";
import { useAuth } from "@/shared/hooks/useAuth";
import { LoadingState } from "@/shared/components/feedback/LoadingState";
import { Alert } from "@/shared/components/ui/alert";
import { DeleteServiceModal } from "@/modules/Services/presentation/components/DeleteServiceModal";
import { Trash2, AlertCircle } from "lucide-react";
import { USER_ROLES, isWorker } from "@/shared/constants/user-roles.constants";

export function DashboardServicesPage() {
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();
  const user = useSelector((state: RootState) => state.auth.user);
  const userRole = user?.role;
  const { getToken } = useAuth();

  // Validación temprana de rol - defensiva programming
  if (!isWorker(userRole)) {
    return (
      <PageContainer>
        <Alert variant="destructive" className="mb-4">
          <AlertCircle className="h-4 w-4" />
          <div>
            <strong>Acceso denegado</strong>
            <p className="text-sm mt-1">
              Esta página solo está disponible para trabajadores. 
              Si eres un trabajador, asegúrate de haber iniciado sesión correctamente.
            </p>
          </div>
        </Alert>
        <Button onClick={() => navigate(ROUTES.DASHBOARD.HOME)} variant="outline">
          Volver al Dashboard
        </Button>
      </PageContainer>
    );
  }
  const [services, setServices] = useState<WorkerServiceDto[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [serviceToDelete, setServiceToDelete] = useState<WorkerServiceDto | null>(null);
  const [deleting, setDeleting] = useState(false);

  const serviceController = useMemo(() => new ServiceController(), []);

  const loadServices = async () => {
    const workerId = user?.id;
    const token = getToken();
    
    if (!workerId || !token) {
      setError("No se encontró sesión. Inicia sesión nuevamente.");
      setLoading(false);
      return;
    }

    setLoading(true);
    setError(null);
    try {
      const data = await serviceController.getWorkerServices(workerId, token);
      setServices(data);
    } catch (err) {
      if (err instanceof Error) {
        setError(err.message);
      } else {
        setError("Error al cargar servicios. Verifica tu conexión.");
      }
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    // Mostrar mensaje de éxito si viene de query params
    const message = searchParams.get('success');
    if (message) {
      setSuccessMessage(decodeURIComponent(message));
      // Limpiar query param
      const newParams = new URLSearchParams(searchParams);
      newParams.delete('success');
      setSearchParams(newParams, { replace: true });
      
      // Cleanup del setTimeout
      const timer = setTimeout(() => setSuccessMessage(null), 5000);
      return () => clearTimeout(timer);
    }
  }, [searchParams, setSearchParams]);

  useEffect(() => {
    // Solo ejecutar si hay usuario
    if (user?.id) {
      void loadServices();
    } else {
      setLoading(false);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [serviceController, user?.id]); // getToken está memoizado y solo lee de localStorage

  const handleDeleteClick = (service: WorkerServiceDto) => {
    setServiceToDelete(service);
    setDeleteModalOpen(true);
  };

  const handleDeleteConfirm = async () => {
    if (!serviceToDelete?.id) return;

    setDeleting(true);
    setError(null);

    try {
      const token = getToken();
      if (!token) {
        setError("Sesión expirada. Inicia sesión nuevamente.");
        return;
      }

      await serviceController.deleteService(serviceToDelete.id, token);
      
      // Cerrar modal primero
      setDeleteModalOpen(false);
      setServiceToDelete(null);
      
      // Recargar servicios después de cerrar modal
      await loadServices();
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : "Error al eliminar el servicio";
      setError(errorMessage);
    } finally {
      setDeleting(false);
    }
  };

  return (
    <PageContainer>
      <div className="space-y-6">
      <div className="flex items-center justify-between gap-4">
        <div>
          <p className="text-sm text-muted-foreground">Servicios del trabajador</p>
          <h1 className="text-2xl font-semibold text-foreground">Mis servicios</h1>
          <p className="text-sm text-text-secondary mt-1 leading-relaxed">
            Gestiona tus servicios, crea nuevos y revisa solicitudes asociadas.
          </p>
        </div>
        <Button onClick={() => navigate(ROUTES.DASHBOARD.SERVICES_NEW)}>
          Crear servicio
        </Button>
      </div>

      {successMessage && (
        <Alert className="mb-4 bg-success/10 text-success-foreground border-success/20">
          {successMessage}
        </Alert>
      )}
      {error && (
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <div>
            <strong>Error</strong>
            <p className="text-sm mt-1">{error}</p>
          </div>
        </Alert>
      )}

      {loading ? (
        <LoadingState variant="grid" count={4} />
      ) : services.length === 0 ? (
        <Card className="p-6 border-dashed border-2 border-border">
          <div className="text-center space-y-3">
            <h2 className="text-lg font-semibold text-foreground">Aún no tienes servicios</h2>
            <p className="text-sm text-muted-foreground leading-relaxed">
              Crea tu primer servicio para comenzar a recibir solicitudes de los usuarios.
            </p>
            <Button onClick={() => navigate(ROUTES.DASHBOARD.SERVICES_NEW)} className="mt-2">
              Crear mi primer servicio
            </Button>
          </div>
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {services.map((service) => (
            <Card key={service.id} className="p-5 border border-border shadow-sm space-y-3">
              <div className="flex items-start justify-between gap-2">
                <div>
                  <p className="text-xs uppercase text-muted-foreground">Categoría</p>
                  <div className="flex items-center gap-2">
                    <span className="text-sm font-semibold text-foreground">{service.category_name}</span>
                    {service.category_icon && (
                      <Badge variant="outline">{service.category_icon}</Badge>
                    )}
                  </div>
                </div>
                <Badge variant={service.is_available ? "default" : "secondary"}>
                  {service.is_available ? "Disponible" : "No disponible"}
                </Badge>
              </div>
              <div>
                <h3 className="text-lg font-semibold text-foreground">{service.title}</h3>
                <p className="text-sm text-text-secondary line-clamp-2 leading-relaxed">{service.description}</p>
              </div>
              <div className="flex items-center justify-between text-sm text-foreground">
                <span>Precio base: <strong className="text-success">${Number(service.base_price).toFixed(2)}</strong></span>
                {isWorker(userRole) && (
                  <div className="flex gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => navigate(ROUTES.DASHBOARD.SERVICE_EDIT(service.id))}
                    >
                      Editar
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleDeleteClick(service)}
                      className="text-destructive hover:text-destructive hover:bg-destructive/10"
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                )}
              </div>
            </Card>
          ))}
        </div>
      )}

      {/* Modal para eliminar servicio */}
      {serviceToDelete && (
        <DeleteServiceModal
          open={deleteModalOpen}
          onOpenChange={setDeleteModalOpen}
          onConfirm={handleDeleteConfirm}
          loading={deleting}
          serviceTitle={serviceToDelete.title}
        />
      )}
      </div>
    </PageContainer>
  );
}
