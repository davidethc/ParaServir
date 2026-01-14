import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { ServiceCategoryController } from "@/modules/ServiceCategories/infra/http/controllers/service-category.controller";
import type { CategoryDetailDto } from "@/modules/ServiceCategories/application/use-cases/get-category-detail.use-case";
import { LocationSearch } from "../components/LocationSearch";
import { Card } from "@/shared/components/ui/card";
import { MapPin } from "lucide-react";
import { WorkersMap } from "@/modules/Geolocation/presentation/components/WorkersMap";

// Componentes compartidos unificados
import { PageContainer } from "@/shared/components/layout/PageContainer";
import { PageHeader } from "@/shared/components/layout/PageHeader";
import { BackButton } from "@/shared/components/navigation/BackButton";
import { LoadingState } from "@/shared/components/feedback/LoadingState";
import { EmptyState } from "@/shared/components/feedback/EmptyState";
import { ServiceCard } from "@/shared/components/cards/ServiceCard";
import { ROUTES } from "@/shared/constants/routes.constants";
import { getCategoryImage } from "@/shared/utils/category-images";

export function DashboardCategoryDetailPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [categoryDetail, setCategoryDetail] = useState<CategoryDetailDto | null>(null);
  const [locationParams, setLocationParams] = useState<{ address?: string; latitude?: number; longitude?: number; radius?: number } | undefined>();
  const categoryController = new ServiceCategoryController();

  useEffect(() => {
    if (!id) {
      setError("ID de categoría no proporcionado");
      setLoading(false);
      return;
    }

    const loadCategoryDetail = async () => {
      try {
        setLoading(true);
        setError(null);
        const detail = await categoryController.getCategoryDetail(id, locationParams);
        setCategoryDetail(detail);
      } catch (err) {
        const errorMessage = err instanceof Error ? err.message : "Error al cargar la categoría";
        setError(errorMessage);
      } finally {
        setLoading(false);
      }
    };

    loadCategoryDetail();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id, locationParams]);

  if (loading) {
    return (
      <PageContainer>
        <LoadingState count={6} variant="card" />
      </PageContainer>
    );
  }

  if (error || !categoryDetail) {
    return (
      <PageContainer>
        <BackButton className="mb-4" />
        <EmptyState
          title={error || "Categoría no encontrada"}
          description="No se pudo cargar la información de la categoría"
          action={{
            label: "Volver al Dashboard",
            onClick: () => window.history.back(),
          }}
        />
      </PageContainer>
    );
  }

  // Validar estructura de datos
  if (!categoryDetail.category) {
    return (
      <PageContainer>
        <BackButton className="mb-4" />
        <EmptyState
          title="Error en los datos"
          description="La estructura de datos recibida no es válida"
        />
      </PageContainer>
    );
  }

  const { category, workers = [], services = [], search_location } = categoryDetail;

  const goToRequest = (opts: { serviceId?: string; workerId?: string }) => {
    try {
      const params = new URLSearchParams();
      if (category?.id) params.set('categoryId', category.id);
      if (opts.serviceId) params.set('serviceId', opts.serviceId);
      if (opts.workerId) params.set('workerId', opts.workerId);
      
      const serviceName = services.find((s) => s.id === opts.serviceId)?.title;
      const workerName =
        services.find((s) => s.id === opts.serviceId)?.worker_name ||
        workers.find((w) => w.worker_id === opts.workerId)?.first_name;
      
      if (serviceName) params.set('serviceName', serviceName);
      if (workerName) params.set('workerName', workerName);

      navigate(`${ROUTES.DASHBOARD.REQUESTS_NEW}?${params.toString()}`);
    } catch (error) {
      console.error("Error al navegar a crear solicitud:", error);
      // Navegar sin parámetros si hay error
      navigate(ROUTES.DASHBOARD.REQUESTS_NEW);
    }
  };

  const availableServices = services.filter((s) => s.is_available ?? true);

  const categoryImage = getCategoryImage(category.name);

  return (
    <PageContainer>
      <BackButton className="mb-4" />
      
      {/* Header con imagen de categoría */}
      {categoryImage && (
        <div className="mb-6 rounded-xl overflow-hidden">
          <img
            src={categoryImage}
            alt={category.name}
            className="w-full h-64 object-cover"
          />
        </div>
      )}
      
      <PageHeader
        title={category.name || "Categoría sin nombre"}
        description={category.description || "Sin descripción disponible"}
      />

      {/* Búsqueda por ubicación */}
      <Card className="p-4 mb-6">
        <LocationSearch
          onLocationChange={(location) => {
            setLocationParams({
              address: location.address,
              latitude: location.latitude,
              longitude: location.longitude,
              radius: 50, // Radio por defecto de 50km
            });
          }}
          initialLocation={locationParams}
        />
      </Card>

      {/* Mapa de trabajadores */}
      {workers.length > 0 && (
        <div className="mb-6">
          <WorkersMap
            workers={workers.map(w => ({
              worker_id: w.worker_id,
              first_name: w.first_name || '',
              last_name: w.last_name || '',
              location: w.location,
              latitude: w.latitude || 0,
              longitude: w.longitude || 0,
              distance_km: w.distance_km,
            }))}
            centerLatitude={locationParams?.latitude}
            centerLongitude={locationParams?.longitude}
            radius={locationParams?.radius || 50}
          />
        </div>
      )}
      
      {/* Estadísticas mejoradas */}
      <div className="flex flex-wrap items-center gap-4 mb-8 p-4 bg-secondary/50 rounded-xl border border-border">
        <div className="flex items-center gap-2">
          <div className="h-2 w-2 rounded-full bg-success" />
          <span className="text-sm font-medium text-foreground">
            {category.workers_count ?? 0} trabajadores disponibles
          </span>
        </div>
        <div className="h-4 w-px bg-border" />
        <div className="flex items-center gap-2">
          <div className="h-2 w-2 rounded-full bg-primary" />
          <span className="text-sm font-medium text-foreground">
            {category.services_count ?? 0} servicios disponibles
          </span>
        </div>
        {search_location && (
          <>
            <div className="h-4 w-px bg-border" />
            <div className="flex items-center gap-2">
              <MapPin className="h-4 w-4 text-primary" />
              <span className="text-sm font-medium text-foreground">
                Buscando en un radio de {search_location.radius_km}km
              </span>
            </div>
          </>
        )}
      </div>

      {/* Servicios con grid mejorado */}
      <section>
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-2xl md:text-3xl font-bold text-foreground">
            Servicios Disponibles
          </h2>
          {availableServices && availableServices.length > 0 && (
            <span className="text-sm text-muted-foreground">
              {availableServices.length} {availableServices.length === 1 ? "servicio" : "servicios"}
            </span>
          )}
        </div>
        {availableServices && availableServices.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {availableServices.map((service) => {
              // Buscar el teléfono del trabajador en el array de workers
              const worker = workers.find((w) => w.worker_id === service.worker_id);
              const workerPhone = worker?.phone;
              
              // Buscar distancia del trabajador si está disponible
              const workerDistance = worker?.distance_km;
              
              return (
                <ServiceCard
                  key={service.id || `service-${Math.random()}`}
                  id={service.id || ""}
                  title={service.title || "Servicio sin título"}
                  description={service.description || "Sin descripción"}
                  basePrice={service.base_price}
                  isAvailable={true}
                  workerName={service.worker_name || "Trabajador desconocido"}
                  workerPhone={workerPhone}
                  workerId={service.worker_id}
                  categoryName={category.name}
                  distanceKm={workerDistance}
                  workerLocation={worker?.location}
                  onClick={() => goToRequest({ serviceId: service.id, workerId: service.worker_id })}
                />
              );
            })}
          </div>
        ) : (
          <EmptyState
            variant="package"
            title="No hay servicios disponibles"
            description="No hay servicios disponibles en esta categoría en este momento. Intenta buscar en otra categoría o vuelve más tarde."
          />
        )}
      </section>
    </PageContainer>
  );
}
