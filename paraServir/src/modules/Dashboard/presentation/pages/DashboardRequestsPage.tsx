import { useEffect, useMemo, useState } from "react";
import { useSearchParams } from "react-router-dom";
import { PageContainer } from "@/shared/components/layout/PageContainer";
import { PageHeader } from "@/shared/components/layout/PageHeader";
import { EmptyState } from "@/shared/components/feedback/EmptyState";
import { Button } from "@/shared/components/ui/button";
import { Card } from "@/shared/components/ui/card";
import { Badge } from "@/shared/components/ui/badge";
import { Alert } from "@/shared/components/ui/alert";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/shared/components/ui/select";
import { LoadingState } from "@/shared/components/feedback/LoadingState";
import { useNavigate } from "react-router-dom";
import { useSelector } from "react-redux";
import type { RootState } from "@/Store";
import { ROUTES } from "@/shared/constants/routes.constants";
import { ServiceRequestController } from "@/modules/ServiceRequests/infra/http/controllers/service-request.controller";
import type { ServiceRequestDto } from "@/modules/ServiceRequests/application/dto/service-request.dto";
import { useAuth } from "@/shared/hooks/useAuth";
import { isClient, isWorker, USER_ROLES } from "@/shared/constants/user-roles.constants";

export function DashboardRequestsPage() {
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();
  const role = useSelector((state: RootState) => state.auth.user?.role);
  const { getToken } = useAuth();
  const [requests, setRequests] = useState<ServiceRequestDto[]>([]);
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const controller = useMemo(() => new ServiceRequestController(), []);

  const load = async (selectedStatus: string) => {
    try {
      setLoading(true);
      setError(null);
      const token = getToken();
      if (!token) {
        setError("Sesión expirada. Inicia sesión nuevamente.");
        return;
      }
      const params = {
        status: selectedStatus && selectedStatus !== "all" ? selectedStatus : undefined,
        as_client: isClient(role),
        as_worker: isWorker(role),
      };
      const data = await controller.list(params, token);
      setRequests(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Error al cargar solicitudes");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    // Mostrar mensaje de éxito si viene de query params
    const message = searchParams.get('success');
    if (message) {
      setSuccessMessage(message);
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
    void load(statusFilter);
  }, [statusFilter, role]);

  const handleUpdateStatus = async (id: string, status: ServiceRequestDto["status"]) => {
    try {
      setError(null);
      const token = getToken();
      if (!token) {
        setError("Sesión expirada. Por favor inicia sesión nuevamente.");
        return;
      }
      await controller.update(id, { status }, token);
      // Recargar lista después de actualizar
      await load(statusFilter);
      // Mostrar mensaje de éxito temporal
      const successMsg = status === "accepted" 
        ? "Solicitud aceptada exitosamente. Puedes ver los detalles y chatear con el cliente."
        : status === "cancelled" 
        ? "Solicitud cancelada exitosamente"
        : "Estado actualizado exitosamente";
      setSuccessMessage(successMsg);
      setTimeout(() => setSuccessMessage(null), 5000);
      
      // Si se aceptó, redirigir al detalle para ver el resumen y opción de chat
      if (status === "accepted" && isWorker(role)) {
        setTimeout(() => {
          navigate(`${ROUTES.DASHBOARD.REQUESTS}/${id}`);
        }, 1000);
      }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : "No se pudo actualizar la solicitud";
      setError(errorMessage);
    }
  };

  const statusLabel: Record<ServiceRequestDto["status"], string> = {
    pending: "Pendiente",
    accepted: "Aceptada",
    in_progress: "En progreso",
    completed: "Completada",
    cancelled: "Cancelada",
  };

  const actionButtons = (req: ServiceRequestDto) => {
    if (isClient(role) && req.status === "pending") {
      return (
        <div className="flex gap-2">
          <Button variant="outline" size="sm" onClick={() => handleUpdateStatus(req.id, "cancelled")}>
            Cancelar
          </Button>
        </div>
      );
    }
    if (isWorker(role) && req.status === "pending") {
      return (
        <div className="flex gap-2">
          <Button size="sm" onClick={() => handleUpdateStatus(req.id, "accepted")}>
            Aceptar
          </Button>
          <Button variant="outline" size="sm" onClick={() => handleUpdateStatus(req.id, "cancelled")}>
            Rechazar
          </Button>
        </div>
      );
    }
    return null;
  };

  return (
    <PageContainer>
      <PageHeader
        title="Mis Solicitudes"
        description="Gestiona tus solicitudes de servicios"
      />
      <div className="flex items-center justify-between mb-4">
        {isClient(role) && (
          <Button onClick={() => navigate(ROUTES.DASHBOARD.REQUESTS_NEW)}>
            Crear solicitud
          </Button>
        )}
        <div className="flex items-center gap-2 ml-auto">
          <Select value={statusFilter || "all"} onValueChange={(val) => setStatusFilter(val || "all")}>
            <SelectTrigger className="w-40">
              <SelectValue placeholder="Estado" />
            </SelectTrigger>
            <SelectContent position="popper">
              <SelectItem value="all">Todas</SelectItem>
              <SelectItem value="pending">Pendiente</SelectItem>
              <SelectItem value="accepted">Aceptada</SelectItem>
              <SelectItem value="in_progress">En progreso</SelectItem>
              <SelectItem value="completed">Completada</SelectItem>
              <SelectItem value="cancelled">Cancelada</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      {successMessage && (
        <Alert className="mb-4 bg-success/10 text-success-foreground border-success/20">
          {successMessage}
        </Alert>
      )}
      {error && (
        <Alert variant="destructive" className="mb-4">
          {error}
        </Alert>
      )}

      {loading ? (
        <LoadingState variant="list" count={3} />
      ) : requests.length === 0 ? (
        <EmptyState
          title={isClient(role) ? "Aún no tienes solicitudes" : "Sin solicitudes asignadas"}
          description={
            isClient(role)
              ? "Crea tu primera solicitud y espera la respuesta del trabajador."
              : "Cuando los clientes te soliciten, aparecerán aquí."
          }
        />
      ) : (
        <div className="space-y-3">
          {requests.map((req) => (
            <Card 
              key={req.id} 
              className="p-4 flex flex-col gap-2 transition-all hover:shadow-md cursor-pointer"
              onClick={() => navigate(`${ROUTES.DASHBOARD.REQUESTS}/${req.id}`)}
            >
              <div className="flex items-start justify-between gap-2">
                <div className="flex-1">
                  <p className="text-xs text-muted-foreground">{req.category_name || "Categoría"}</p>
                  <h3 className="text-lg font-semibold text-foreground">
                    {req.service_title || "Solicitud de servicio"}
                  </h3>
                  <p className="text-sm text-muted-foreground line-clamp-2 leading-relaxed">{req.description}</p>
                </div>
                <Badge>{statusLabel[req.status]}</Badge>
              </div>
              <div className="text-sm text-muted-foreground flex gap-4 flex-wrap">
                {isClient(role) && req.worker_name && <span>Trabajador: {req.worker_name}</span>}
                {isWorker(role) && <span>Cliente asociado</span>}
                <span>Fecha: {new Date(req.scheduled_date).toLocaleString()}</span>
              </div>
              <div className="flex justify-between items-center" onClick={(e) => e.stopPropagation()}>
                <span className="text-sm text-foreground">{req.address}</span>
                {actionButtons(req)}
              </div>
            </Card>
          ))}
        </div>
      )}
    </PageContainer>
  );
}
