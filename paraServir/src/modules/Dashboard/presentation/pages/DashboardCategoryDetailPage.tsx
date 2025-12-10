import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { ServiceCategoryController } from "@/modules/ServiceCategories/infra/http/controllers/service-category.controller";
import type { CategoryDetailDto } from "@/modules/ServiceCategories/application/use-cases/get-category-detail.use-case";

// Componentes compartidos unificados
import { PageContainer } from "@/shared/components/layout/PageContainer";
import { PageHeader } from "@/shared/components/layout/PageHeader";
import { BackButton } from "@/shared/components/navigation/BackButton";
import { LoadingState } from "@/shared/components/feedback/LoadingState";
import { EmptyState } from "@/shared/components/feedback/EmptyState";
import { WorkerCard } from "@/shared/components/cards/WorkerCard";
import { ServiceCard } from "@/shared/components/cards/ServiceCard";

export function DashboardCategoryDetailPage() {
  const { id } = useParams<{ id: string }>();
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
        console.log("Loading category detail for ID:", id);
        const detail = await categoryController.getCategoryDetail(id);
        console.log("Category detail loaded:", detail);
        console.log("Category structure:", {
          hasCategory: !!detail.category,
          categoryKeys: detail.category ? Object.keys(detail.category) : [],
          workersCount: detail.workers?.length || 0,
          servicesCount: detail.services?.length || 0,
        });
        setCategoryDetail(detail);
      } catch (err) {
        console.error("Error loading category detail:", err);
        const errorMessage = err instanceof Error ? err.message : "Error al cargar la categoría";
        setError(errorMessage);
        // También mostrar en consola para debug
        console.error("Full error:", err);
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

  return (
    <PageContainer>
      <BackButton className="mb-4" />
      
      <PageHeader
        title={category.name || "Categoría sin nombre"}
        description={category.description || "Sin descripción disponible"}
      />
      
      {/* Estadísticas */}
      <div className="flex gap-4 text-sm text-gray-600 mb-8">
        <span>{category.workers_count ?? 0} trabajadores disponibles</span>
        <span>•</span>
        <span>{category.services_count ?? 0} servicios disponibles</span>
      </div>

      {/* Trabajadores */}
      <section className="mb-8">
        <h2 className="text-2xl font-semibold text-gray-900 mb-4">
          Trabajadores Disponibles
        </h2>
        {workers && workers.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {workers.map((worker) => (
              <WorkerCard
                key={worker.worker_id || `worker-${Math.random()}`}
                workerId={worker.worker_id || ""}
                firstName={worker.first_name || "Sin nombre"}
                lastName={worker.last_name || ""}
                avatarUrl={worker.avatar_url}
                location={worker.location}
                yearsExperience={worker.years_experience}
                verificationStatus={worker.verification_status || "pending"}
                isActive={worker.is_active ?? true}
                servicesCount={worker.services_count || 0}
                minPrice={worker.min_price}
                maxPrice={worker.max_price}
              />
            ))}
          </div>
        ) : (
          <EmptyState
            title="No hay trabajadores disponibles"
            description="No hay trabajadores ofreciendo servicios en esta categoría en este momento"
          />
        )}
      </section>

      {/* Servicios */}
      <section>
        <h2 className="text-2xl font-semibold text-gray-900 mb-4">
          Servicios Disponibles
        </h2>
        {services && services.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {services.map((service) => (
              <ServiceCard
                key={service.id || `service-${Math.random()}`}
                id={service.id || ""}
                title={service.title || "Servicio sin título"}
                description={service.description || "Sin descripción"}
                basePrice={service.base_price}
                isAvailable={service.is_available ?? true}
                workerName={service.worker_name || "Trabajador desconocido"}
              />
            ))}
          </div>
        ) : (
          <EmptyState
            title="No hay servicios disponibles"
            description="No hay servicios disponibles en esta categoría en este momento"
          />
        )}
      </section>
    </PageContainer>
  );
}
