import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { ServiceCategoryController } from "@/modules/ServiceCategories/infra/http/controllers/service-category.controller";
import type { CategoryDetailDto } from "@/modules/ServiceCategories/application/use-cases/get-category-detail.use-case";
import { MapPin, Navigation, Search } from "lucide-react";
import { WorkersMap } from "@/modules/Geolocation/presentation/components/WorkersMap";
import { Input } from "@/shared/components/ui/input";
import { Button } from "@/shared/components/ui/button";

// Componentes compartidos unificados
import { PageContainer } from "@/shared/components/layout/PageContainer";
import { BackButton } from "@/shared/components/navigation/BackButton";
import { LoadingState } from "@/shared/components/feedback/LoadingState";
import { EmptyState } from "@/shared/components/feedback/EmptyState";
import { ServiceCard } from "@/shared/components/cards/ServiceCard";
import { ROUTES } from "@/shared/constants/routes.constants";
import { getCategoryIcon } from "@/shared/Utils/category-icons";

export function DashboardCategoryDetailPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [categoryDetail, setCategoryDetail] = useState<CategoryDetailDto | null>(null);
  const [locationParams] = useState<{ address?: string; latitude?: number; longitude?: number; radius?: number } | undefined>();
  const [searchTerm, setSearchTerm] = useState("");
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
      navigate(ROUTES.DASHBOARD.REQUESTS_NEW);
    }
  };

  const availableServices = services.filter((s) => s.is_available ?? true);
  const CategoryIcon = getCategoryIcon(category.name);

  return (
    <div className="min-h-screen bg-muted/20">
      {/* Compact Header */}
      <div className="bg-white border-b border-border">
        <div className="max-w-7xl mx-auto px-6 py-8">
          {/* Breadcrumb */}
          <nav className="flex items-center gap-2 text-sm mb-4 text-muted-foreground">
            <button
              onClick={() => navigate('/dashboard/categorias')}
              className="hover:underline transition-all hover:text-foreground"
            >
              Categorías
            </button>
            <span>/</span>
            <span className="font-medium text-foreground">{category.name}</span>
          </nav>

          {/* Content */}
          <div className="flex items-start justify-between gap-8">
            {/* Left: Icon, Title, Description */}
            <div className="flex-1">
              {/* Category Icon with Gradient Background */}
              <div
                className="inline-flex items-center justify-center w-16 h-16 rounded-2xl mb-4"
                style={{
                  background: 'linear-gradient(to right, #58A3B0, #6558B0, #5877B0)'
                }}
              >
                <CategoryIcon size={32} className="text-white" />
              </div>

              <h1 className="text-4xl font-bold mb-3 text-foreground">{category.name}</h1>
              <p className="text-lg text-muted-foreground max-w-2xl leading-relaxed">
                {category.description || "Encuentra los mejores profesionales en esta categoría"}
              </p>
            </div>

            {/* Right: Stats */}
            <div className="flex gap-6 bg-muted/30 rounded-xl p-6 shrink-0 border border-border">
              <div className="text-center">
                <div className="text-3xl font-bold text-foreground">{category.workers_count ?? 0}</div>
                <div className="text-sm text-muted-foreground">Trabajadores</div>
              </div>
              <div className="w-px bg-border" />
              <div className="text-center">
                <div className="text-3xl font-bold text-foreground">{category.services_count ?? 0}</div>
                <div className="text-sm text-muted-foreground">Servicios</div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Enhanced Search Section - Sticky */}
      <div className="bg-white border-b border-border sticky top-0 z-10 shadow-sm">
        <div className="max-w-7xl mx-auto px-6 py-4">
          <div className="flex gap-4 items-center">
            {/* Location Input */}
            <div className="flex-1 relative">
              <MapPin className="absolute left-4 top-1/2 -translate-y-1/2 text-muted-foreground" size={20} />
              <Input
                type="text"
                placeholder="Ej: Quito, Ecuador"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-12 pr-4 py-3 text-base"
              />
            </div>

            {/* Search Button */}
            <Button
              className="px-8 py-6 font-medium text-base"
              onClick={() => {
                // TODO: Handle search
              }}
            >
              <Search className="mr-2 h-5 w-5" />
              Buscar
            </Button>

            {/* Use My Location Button */}
            <Button
              variant="outline"
              className="p-6"
              onClick={() => {
                // TODO: Get user's location
              }}
              title="Usar mi ubicación"
            >
              <Navigation size={20} />
            </Button>
          </div>

          {/* Quick Filters */}
          <div className="flex gap-2 mt-3 overflow-x-auto pb-1">
            <Button
              variant="secondary"
              size="sm"
              className="rounded-full shrink-0"
            >
              Mejor calificados
            </Button>
            <Button
              variant="secondary"
              size="sm"
              className="rounded-full shrink-0"
            >
              Menor precio
            </Button>
            <Button
              variant="secondary"
              size="sm"
              className="rounded-full shrink-0"
            >
              Más cercanos
            </Button>
            <Button
              variant="secondary"
              size="sm"
              className="rounded-full shrink-0"
            >
              Disponibles hoy
            </Button>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <PageContainer className="mt-8">
        {/* Workers Map - Fixed Height */}
        {workers.length > 0 && (
          <div className="mb-8">
            <h2 className="text-2xl font-bold text-foreground mb-4">
              Trabajadores en el mapa
            </h2>
            <div className="rounded-xl overflow-hidden border border-border shadow-sm h-[400px]">
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
          </div>
        )}

        {/* Location Info */}
        {search_location && (
          <div className="flex items-center gap-2 mb-6 p-4 bg-secondary/30 rounded-lg border border-border">
            <MapPin className="h-5 w-5 text-primary shrink-0" />
            <span className="text-sm font-medium text-foreground">
              Buscando en un radio de {search_location.radius_km}km desde tu ubicación
            </span>
          </div>
        )}

        {/* Services Grid */}
        <section>
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-3xl font-bold text-foreground">
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
                const worker = workers.find((w) => w.worker_id === service.worker_id);
                const workerPhone = worker?.phone;
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
    </div>
  );
}
