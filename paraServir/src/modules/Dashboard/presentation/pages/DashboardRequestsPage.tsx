import { useEffect, useMemo, useState } from "react";
import { useSearchParams, useNavigate } from "react-router-dom";
import { useSelector } from "react-redux";
import type { RootState } from "@/Store";
import { useAuth } from "@/shared/hooks/useAuth";
import { isClient, isWorker } from "@/shared/constants/user-roles.constants";
import { ROUTES } from "@/shared/constants/routes.constants";

// Components
import { PageContainer } from "@/shared/components/layout/PageContainer";
import { Button } from "@/shared/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/shared/components/ui/select";
import { SearchBar } from "@/shared/components/ui/SearchBar";
import { ToastContainer } from "@/shared/components/feedback/ToastContainer";
import { RequestFilters } from "@/modules/ServiceRequests/presentation/components/RequestFilters";
import { RequestCard } from "@/modules/ServiceRequests/presentation/components/RequestCard";
import { RequestSkeletonList } from "@/modules/ServiceRequests/presentation/components/RequestSkeleton";
import { RequestsEmptyState } from "@/modules/ServiceRequests/presentation/components/RequestsEmptyState";
import { RequestDetailsModal } from "@/modules/ServiceRequests/presentation/components/RequestDetailsModal";

// Hooks and Utils
import { useToast } from "@/shared/hooks/useToast";
import { ServiceRequestController } from "@/modules/ServiceRequests/infra/http/controllers/service-request.controller";
import type { ServiceRequestDto } from "@/modules/ServiceRequests/application/dto/service-request.dto";
import { Plus } from "lucide-react";

export function DashboardRequestsPage() {
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();
  const role = useSelector((state: RootState) => state.auth.user?.role);
  const { getToken } = useAuth();
  const toast = useToast();

  // State
  const [requests, setRequests] = useState<ServiceRequestDto[]>([]);
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [searchTerm, setSearchTerm] = useState("");
  const [sortBy, setSortBy] = useState("recent");
  const [loading, setLoading] = useState(true);
  const [selectedRequest, setSelectedRequest] = useState<ServiceRequestDto | null>(null);
  const [showModal, setShowModal] = useState(false);

  const controller = useMemo(() => new ServiceRequestController(), []);

  // Load requests
  const load = async (selectedStatus: string) => {
    try {
      setLoading(true);
      const token = getToken();
      if (!token) {
        toast.error("Sesión expirada", "Por favor inicia sesión nuevamente");
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
      toast.error(
        "Error al cargar solicitudes",
        err instanceof Error ? err.message : "Intenta nuevamente"
      );
    } finally {
      setLoading(false);
    }
  };

  // Handle success message from URL params
  useEffect(() => {
    const message = searchParams.get('success');
    if (message) {
      toast.success("¡Éxito!", message);
      const newParams = new URLSearchParams(searchParams);
      newParams.delete('success');
      setSearchParams(newParams, { replace: true });
    }
  }, [searchParams, setSearchParams, toast]);

  // Load on mount and filter change
  useEffect(() => {
    void load(statusFilter);
  }, [statusFilter, role]);

  // Handle status update
  const handleUpdateStatus = async (id: string, status: ServiceRequestDto["status"]) => {
    try {
      const token = getToken();
      if (!token) {
        toast.error("Sesión expirada", "Por favor inicia sesión nuevamente");
        return;
      }
      await controller.update(id, { status }, token);
      await load(statusFilter);

      const successMsg =
        status === "accepted"
          ? "Solicitud aceptada exitosamente"
          : status === "cancelled"
            ? "Solicitud cancelada"
            : "Estado actualizado";

      toast.success(successMsg, "Los cambios se han guardado");

      if (status === "accepted" && isWorker(role)) {
        setTimeout(() => {
          navigate(`${ROUTES.DASHBOARD.REQUESTS}/${id}`);
        }, 1000);
      }
    } catch (err) {
      toast.error(
        "Error al actualizar",
        err instanceof Error ? err.message : "Intenta nuevamente"
      );
    }
  };

  // Handle card actions
  const handleCardAction = (request: ServiceRequestDto, action: string) => {
    switch (action) {
      case 'contact':
      case 'chat':
        toast.info("Chat", "Redirigiendo al chat...");
        // TODO: Navigate to chat
        break;
      case 'rate':
        toast.info("Calificación", "Próximamente podrás calificar el servicio");
        break;
      case 'rebook':
        navigate(ROUTES.DASHBOARD.REQUESTS_NEW, {
          state: { previousRequest: request },
        });
        break;
      case 'delete':
        toast.warning("Eliminar", "¿Estás seguro de eliminar esta solicitud?");
        break;
      case 'menu':
        // TODO: Show context menu
        break;
    }
  };

  // Filter and sort requests
  const filteredRequests = useMemo(() => {
    return requests
      .filter(req => {
        if (statusFilter !== "all" && req.status !== statusFilter) return false;
        if (searchTerm) {
          const search = searchTerm.toLowerCase();
          return (
            req.service_title?.toLowerCase().includes(search) ||
            req.worker_name?.toLowerCase().includes(search) ||
            req.category_name?.toLowerCase().includes(search) ||
            req.description?.toLowerCase().includes(search)
          );
        }
        return true;
      })
      .sort((a, b) => {
        switch (sortBy) {
          case "recent":
            return new Date(b.created_at || b.scheduled_date).getTime() -
              new Date(a.created_at || a.scheduled_date).getTime();
          case "oldest":
            return new Date(a.created_at || a.scheduled_date).getTime() -
              new Date(b.created_at || b.scheduled_date).getTime();
          case "scheduled":
            return new Date(a.scheduled_date).getTime() -
              new Date(b.scheduled_date).getTime();
          default:
            return 0;
        }
      });
  }, [requests, statusFilter, searchTerm, sortBy]);

  // Status counts
  const statusCounts = useMemo(() => {
    return {
      all: requests.length,
      pending: requests.filter(r => r.status === "pending").length,
      accepted: requests.filter(r => r.status === "accepted").length,
      in_progress: requests.filter(r => r.status === "in_progress").length,
      completed: requests.filter(r => r.status === "completed").length,
      cancelled: requests.filter(r => r.status === "cancelled").length,
    };
  }, [requests]);

  return (
    <PageContainer>
      <ToastContainer toasts={toast.toasts} onRemove={toast.removeToast} />

      {/* Header */}
      <div className="mb-6">
        <div className="flex items-start justify-between mb-4">
          <div className="flex-1">
            <h1 className="text-3xl font-bold text-foreground mb-1">
              Mis Solicitudes ({statusCounts.all})
            </h1>
            <p className="text-muted-foreground">
              Gestiona y da seguimiento a tus solicitudes de servicios
            </p>
          </div>
          {isClient(role) && (
            <Button
              size="lg"
              onClick={() => navigate(ROUTES.DASHBOARD.REQUESTS_NEW)}
              style={{ backgroundColor: '#58A3B0' }}
              className="text-white hover:bg-[#4A8A95] gap-2 shadow-sm"
            >
              <Plus size={20} />
              Crear solicitud
            </Button>
          )}
        </div>

        {/* Search and Sort */}
        <div className="flex flex-col sm:flex-row gap-3 mb-4">
          <SearchBar
            value={searchTerm}
            onChange={setSearchTerm}
            placeholder="Buscar por servicio o trabajador..."
            className="flex-1 max-w-md"
          />
          <Select value={sortBy} onValueChange={setSortBy}>
            <SelectTrigger className="w-full sm:w-48">
              <SelectValue placeholder="Ordenar por" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="recent">Más recientes</SelectItem>
              <SelectItem value="oldest">Más antiguas</SelectItem>
              <SelectItem value="scheduled">Por fecha programada</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {/* Filters */}
        <RequestFilters
          current={statusFilter}
          onChange={setStatusFilter}
          counts={statusCounts}
        />
      </div>

      {/* Content */}
      {loading ? (
        <RequestSkeletonList count={3} />
      ) : filteredRequests.length === 0 ? (
        requests.length === 0 ? (
          <RequestsEmptyState isClient={isClient(role)} />
        ) : (
          <div className="text-center py-12">
            <p className="text-muted-foreground mb-2">
              No se encontraron solicitudes con los filtros aplicados
            </p>
            <Button
              variant="outline"
              onClick={() => {
                setStatusFilter("all");
                setSearchTerm("");
              }}
            >
              Limpiar filtros
            </Button>
          </div>
        )
      ) : (
        <div className="space-y-4 pb-6">
          {filteredRequests.map((request) => (
            <RequestCard
              key={request.id}
              request={request}
              role={role}
              onViewDetails={() => {
                setSelectedRequest(request);
                setShowModal(true);
              }}
              onUpdateStatus={(status) => handleUpdateStatus(request.id, status)}
              onAction={(action) => handleCardAction(request, action)}
            />
          ))}
        </div>
      )}

      {/* Details Modal */}
      <RequestDetailsModal
        request={selectedRequest}
        isOpen={showModal}
        onClose={() => {
          setShowModal(false);
          setSelectedRequest(null);
        }}
        role={role}
      />
    </PageContainer>
  );
}
