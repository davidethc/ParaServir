import { useMemo } from "react";
import { useLocation, useNavigate, useParams } from "react-router-dom";
import { ROUTES } from "@/shared/constants/routes.constants";
import { CreateBasicServiceForm } from "@/modules/Services/presentation/CreateBasicServiceForm";
import { ServiceController } from "@/modules/Services/infra/http/controllers/service.controller";
import { AuthStorageService } from "@/shared/services/auth-storage.service";
import { useEffect, useState } from "react";
import type { WorkerServiceDto } from "@/modules/Services/application/dto/worker-service.dto";
import { LoadingState } from "@/shared/components/feedback/LoadingState";
import { Alert } from "@/shared/components/ui/alert";

/**
 * Página de edición de servicio reutilizando el formulario de creación.
 * Prellena campos y llama al update.
 */
export function DashboardServiceEditPage() {
  const { id } = useParams<{ id: string }>();
  const location = useLocation();
  const navigate = useNavigate();
  const controller = useMemo(() => new ServiceController(), []);
  const token = useMemo(() => AuthStorageService.getToken() || "", []);
  const workerId = useMemo(() => AuthStorageService.getUserId() || "", []);
  const [service, setService] = useState<WorkerServiceDto | null>(
    (location.state as { service?: WorkerServiceDto } | null)?.service || null
  );
  const [loading, setLoading] = useState(!service);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchService = async () => {
      if (!id || !workerId || !token || service) return;
      try {
        setLoading(true);
        const list = await controller.getWorkerServices(workerId, token);
        const found = list.find((s) => s.id === id);
        if (!found) {
          setError("No se encontró el servicio");
        } else {
          setService(found);
        }
      } catch (err) {
        setError(err instanceof Error ? err.message : "Error al cargar servicio");
      } finally {
        setLoading(false);
      }
    };
    fetchService();
  }, [controller, id, service, token, workerId]);

  if (!id) {
    return (
      <Alert variant="destructive" className="m-6">
        Identificador de servicio inválido.
      </Alert>
    );
  }

  if (loading) {
    return (
      <div className="p-6">
        <LoadingState variant="grid" count={3} />
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-6 space-y-4">
        <Alert variant="destructive">{error}</Alert>
        <button
          className="text-primary hover:text-primary-hover underline font-medium"
          onClick={() => navigate(ROUTES.DASHBOARD.SERVICES)}
        >
          Volver
        </button>
      </div>
    );
  }

  return (
    <CreateBasicServiceForm
      mode="edit"
      serviceId={id}
      initialService={service || undefined}
    />
  );
}
