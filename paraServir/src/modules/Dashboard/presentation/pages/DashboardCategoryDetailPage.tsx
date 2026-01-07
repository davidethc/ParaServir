import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { ServiceCategoryController } from "@/modules/ServiceCategories/infra/http/controllers/service-category.controller";
import type { CategoryDetailDto } from "@/modules/ServiceCategories/application/use-cases/get-category-detail.use-case";

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
        const detail = await categoryController.getCategoryDetail(id);
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
  }, [id]);

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

  const { category, workers = [], services = [] } = categoryDetail;

  const goToRequest = (opts: { serviceId?: string; workerId?: string }) => {
    const params = new URLSearchParams();
    if (category.id) params.set('categoryId', category.id);
    if (opts.serviceId) params.set('serviceId', opts.serviceId);
    if (opts.workerId) params.set('workerId', opts.workerId);
    
    const serviceName = services.find((s) => s.id === opts.serviceId)?.title;
    const workerName =
      services.find((s) => s.id === opts.serviceId)?.worker_name ||
      workers.find((w) => w.worker_id === opts.workerId)?.first_name;
    
    if (serviceName) params.set('serviceName', serviceName);
    if (workerName) params.set('workerName', workerName);

    navigate(`${ROUTES.DASHBOARD.REQUESTS_NEW}?${params.toString()}`);
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
            {availableServices.map((service) => (
              <ServiceCard
                key={service.id || `service-${Math.random()}`}
                id={service.id || ""}
                title={service.title || "Servicio sin título"}
                description={service.description || "Sin descripción"}
                basePrice={service.base_price}
                isAvailable={true}
                workerName={service.worker_name || "Trabajador desconocido"}
                categoryName={category.name}
                onClick={() => goToRequest({ serviceId: service.id, workerId: service.worker_id })}
              />
            ))}
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
