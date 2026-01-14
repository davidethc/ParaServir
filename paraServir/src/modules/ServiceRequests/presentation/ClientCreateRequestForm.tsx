import { useEffect, useMemo, useState } from "react";
import { useSearchParams, useNavigate } from "react-router-dom";
import { Card } from "@/shared/components/ui/card";
import { Input } from "@/shared/components/ui/input";
import { Textarea } from "@/shared/components/ui/textarea";
import { Button } from "@/shared/components/ui/button";
import { Label } from "@/shared/components/ui/label";
import { Alert } from "@/shared/components/ui/alert";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/shared/components/ui/select";
import { ROUTES } from "@/shared/constants/routes.constants";
import type { CategoryDetailDto } from "@/modules/ServiceCategories/application/use-cases/get-category-detail.use-case";
import { ServiceRequestController } from "@/modules/ServiceRequests/infra/http/controllers/service-request.controller";
import { ServiceCategoryController } from "@/modules/ServiceCategories/infra/http/controllers/service-category.controller";
import { useCategories } from "@/shared/hooks/useCategories";
import { useAuth } from "@/shared/hooks/useAuth";
import { LoadingState } from "@/shared/components/feedback/LoadingState";
import { isClient, USER_ROLES } from "@/shared/constants/user-roles.constants";
import { AlertCircle } from "lucide-react";

export function ClientCreateRequestForm() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { getToken, user } = useAuth();
  const { categories, loading: loadingCategories } = useCategories();

  // Validación temprana de rol - defensiva programming
  if (!isClient(user?.role)) {
    return (
      <div className="min-h-screen flex items-center justify-center p-4">
        <Alert variant="destructive" className="max-w-md">
          <AlertCircle className="h-4 w-4" />
          <div>
            <strong>Acceso denegado</strong>
            <p className="text-sm mt-1">
              Esta página solo está disponible para clientes (usuarios). 
              Los trabajadores no pueden crear solicitudes de servicio.
            </p>
          </div>
        </Alert>
      </div>
    );
  }

  const prefilledWorkerId = searchParams.get('workerId') || "";
  const prefilledServiceId = searchParams.get('serviceId') || "";
  const prefilledCategoryId = searchParams.get('categoryId') || "";
  const prefilledWorkerName = searchParams.get('workerName') || "";

  const [categoryId, setCategoryId] = useState(prefilledCategoryId);
  const [services, setServices] = useState<CategoryDetailDto["services"]>([]);
  const [serviceId, setServiceId] = useState(prefilledServiceId);
  const [workerId, setWorkerId] = useState(prefilledWorkerId);
  const [workerName, setWorkerName] = useState(prefilledWorkerName);
  const [description, setDescription] = useState("");
  const [address, setAddress] = useState("");
  const [scheduledDate, setScheduledDate] = useState("");
  const [loading, setLoading] = useState(false);
  const [loadingServices, setLoadingServices] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const requestController = useMemo(() => new ServiceRequestController(), []);
  const categoryController = useMemo(() => new ServiceCategoryController(), []);

  // Determinar qué campos están habilitados
  const isCategorySelected = !!categoryId;
  const isServiceSelected = !!serviceId;
  // Los campos de descripción, dirección y fecha solo se habilitan cuando se selecciona un servicio
  const areFieldsEnabled = isServiceSelected;

  // Cargar servicios cuando se selecciona una categoría
  useEffect(() => {
    const loadServices = async () => {
      if (!categoryId) {
        setServices([]);
        setServiceId("");
        setWorkerId("");
        setWorkerName("");
        return;
      }

      try {
        setLoadingServices(true);
        setError(null);
        const detail = await categoryController.getCategoryDetail(categoryId);
        const availableServices = (detail.services || []).filter((s) => s.is_available ?? true);
        setServices(availableServices);
        
        // Si había un servicio preseleccionado, mantenerlo
        if (prefilledServiceId && availableServices.find((s) => s.id === prefilledServiceId)) {
          const service = availableServices.find((s) => s.id === prefilledServiceId);
          if (service) {
            setServiceId(service.id);
            setWorkerId(service.worker_id);
            setWorkerName(service.worker_name);
          }
        }
      } catch (err) {
        if (err instanceof Error) {
          setError(err.message);
        } else {
          setError("No se pudieron cargar los servicios de esta categoría.");
        }
      } finally {
        setLoadingServices(false);
      }
    };

    loadServices();
  }, [categoryId, categoryController, prefilledServiceId]);

  // Cuando se selecciona un servicio, autocompletar trabajador
  useEffect(() => {
    if (serviceId && services.length > 0) {
      const selectedService = services.find((s) => s.id === serviceId);
      if (selectedService) {
        setWorkerId(selectedService.worker_id);
        setWorkerName(selectedService.worker_name);
      }
    } else if (!serviceId) {
      setWorkerId("");
      setWorkerName("");
    }
  }, [serviceId, services]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!categoryId) {
      setError("Selecciona una categoría.");
      return;
    }
    if (!description.trim()) {
      setError("La descripción es obligatoria.");
      return;
    }
    if (!address.trim()) {
      setError("La dirección es obligatoria.");
      return;
    }
    if (!scheduledDate) {
      setError("Selecciona fecha y hora.");
      return;
    }

    const token = getToken();
    if (!token) {
      setError("Sesión expirada. Inicia sesión nuevamente.");
      navigate(ROUTES.PUBLIC.LOGIN);
      return;
    }

    setLoading(true);
    try {

      await requestController.create(
        {
          category_id: categoryId,
          description,
          address,
          scheduled_date: new Date(scheduledDate).toISOString(),
          worker_id: workerId || undefined,
          service_id: serviceId || undefined,
        },
        token
      );

      navigate(`${ROUTES.DASHBOARD.REQUESTS}?success=${encodeURIComponent("Solicitud creada. Espera la respuesta del trabajador.")}`, {
        replace: true,
      });
    } catch (err) {
      if (err instanceof Error) {
        setError(err.message);
      } else {
        setError("No se pudo crear la solicitud. Intenta nuevamente.");
      }
    } finally {
      setLoading(false);
    }
  };

  if (loadingCategories) {
    return (
      <div className="p-6">
        <LoadingState variant="grid" count={3} />
      </div>
    );
  }

  return (
    <div className="min-h-screen flex bg-background overflow-y-auto">
      <div className="flex-1 flex flex-col px-4 sm:px-6 py-6 sm:py-8 max-w-3xl mx-auto w-full space-y-6 pb-20">
        <div className="space-y-1">
          <p className="text-sm text-muted-foreground">Solicitudes</p>
          <h1 className="text-2xl font-semibold text-foreground">Crear solicitud</h1>
          <p className="text-sm text-text-secondary leading-relaxed">Describe qué necesitas y cuándo.</p>
        </div>

        <Card className="p-6 border border-border shadow-sm relative overflow-visible">
          {error && <Alert variant="destructive" className="mb-4">{error}</Alert>}
          <form onSubmit={handleSubmit} className="space-y-5 relative overflow-visible">
            <div className="relative">
              <Label className="text-sm font-medium text-foreground">Categoría *</Label>
              <Select value={categoryId} onValueChange={setCategoryId} disabled={loading}>
                <SelectTrigger className="mt-1">
                  <SelectValue placeholder="Selecciona una categoría" />
                </SelectTrigger>
                <SelectContent position="popper">
                  {categories.map((cat) => (
                    <SelectItem key={cat.id} value={cat.id}>
                      {cat.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label className="text-sm font-medium text-foreground">Servicio {isCategorySelected ? "(opcional)" : ""}</Label>
                {!isCategorySelected ? (
                  <Input
                    value=""
                    placeholder="Primero selecciona una categoría"
                    className="mt-1 cursor-not-allowed"
                    disabled
                  />
                ) : loadingServices ? (
                  <div className="mt-1 p-3 border border-border rounded-md bg-muted text-sm text-muted-foreground">
                    Cargando servicios...
                  </div>
                ) : (
                  <Select
                    value={serviceId}
                    onValueChange={setServiceId}
                    disabled={loading || loadingServices}
                  >
                    <SelectTrigger className="mt-1">
                      <SelectValue placeholder="Selecciona un servicio" />
                    </SelectTrigger>
                    <SelectContent position="popper" className="max-h-80">
                      {services.length > 0 ? (
                        services.map((service) => (
                          <SelectItem key={service.id} value={service.id}>
                            <div className="flex flex-col">
                              <span className="font-medium">{service.title}</span>
                              <span className="text-xs text-muted-foreground">
                                Por: {service.worker_name} - ${service.base_price?.toFixed(2) || "0.00"}
                              </span>
                            </div>
                          </SelectItem>
                        ))
                      ) : (
                        <div className="p-2 text-sm text-muted-foreground">No hay servicios disponibles</div>
                      )}
                    </SelectContent>
                  </Select>
                )}
              </div>
              <div>
                <Label className="text-sm font-medium text-foreground">Trabajador</Label>
                {workerName ? (
                  <div className="mt-1 p-3 border border-border rounded-md bg-muted text-sm text-foreground">
                    {workerName}
                    <Input type="hidden" value={workerId} readOnly />
                  </div>
                ) : (
                  <Input
                    value=""
                    placeholder={isServiceSelected ? "Selecciona un servicio primero" : isCategorySelected ? "Selecciona un servicio" : "Primero selecciona una categoría"}
                    className="mt-1 cursor-not-allowed"
                    disabled
                  />
                )}
              </div>
            </div>

            <div>
              <Label className="text-sm font-medium text-foreground">Descripción *</Label>
              <Textarea
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder={areFieldsEnabled ? "Cuenta el problema o el trabajo a realizar" : "Primero selecciona una categoría"}
                rows={4}
                className="mt-1"
                disabled={loading || !areFieldsEnabled}
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label className="text-sm font-medium text-foreground">Dirección *</Label>
                <Input
                  value={address}
                  onChange={(e) => setAddress(e.target.value)}
                  placeholder={areFieldsEnabled ? "Av. Principal 123, Ciudad" : "Primero selecciona una categoría"}
                  className="mt-1"
                  disabled={loading || !areFieldsEnabled}
                />
              </div>
              <div>
                <Label className="text-sm font-medium text-foreground">Fecha y hora *</Label>
                <Input
                  type="datetime-local"
                  value={scheduledDate}
                  onChange={(e) => setScheduledDate(e.target.value)}
                  className="mt-1"
                  disabled={loading || !areFieldsEnabled}
                />
              </div>
            </div>

            <div className="flex justify-end gap-3 pt-2">
              <Button
                type="button"
                variant="outline"
                onClick={() => navigate(-1)}
                disabled={loading}
              >
                Cancelar
              </Button>
              <Button type="submit" disabled={loading}>
                {loading ? "Enviando..." : "Enviar solicitud"}
              </Button>
            </div>
          </form>
        </Card>

        {isClient(user?.role) && (
          <p className="text-xs text-muted-foreground">
            Podrás editar o cancelar la solicitud mientras esté pendiente; cuando el trabajador la acepte, solo podrás cancelar si el backend lo permite.
          </p>
        )}
      </div>
    </div>
  );
}
