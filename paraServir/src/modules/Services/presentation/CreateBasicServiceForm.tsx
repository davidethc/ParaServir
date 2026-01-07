import { useState, useEffect, useMemo } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { ROUTES } from "@/shared/constants/routes.constants";
import { Input } from "@/shared/components/ui/input";
import { Select } from "@/shared/components/ui/select";
import { Button } from "@/shared/components/ui/button";
import { Card } from "@/shared/components/ui/card";
import { Label } from "@/shared/components/ui/label";
import { Alert } from "@/shared/components/ui/alert";
import { Textarea } from "@/shared/components/ui/textarea";
import { SelectionButton } from "@/shared/components/ui/selection-button";
import {
  SelectTrigger,
  SelectValue,
  SelectContent,
  SelectItem
} from "@/shared/components/ui/select";
import { ServiceController } from "@/modules/Services/infra/http/controllers/service.controller";
import type { WorkerServiceDto } from "../application/dto/worker-service.dto";
import type { UpdateServiceDto } from "../application/dto/update-service.dto";
import { useCategories } from "@/shared/hooks/useCategories";
import { useAuth } from "@/shared/hooks/useAuth";
import { isWorker } from "@/shared/constants/user-roles.constants";

type FormMode = "create" | "edit";

interface CreateBasicServiceFormProps {
  mode?: FormMode;
  serviceId?: string;
  initialService?: WorkerServiceDto;
}

export function CreateBasicServiceForm({
  mode = "create",
  serviceId,
  initialService,
}: CreateBasicServiceFormProps) {
  const navigate = useNavigate();
  const location = useLocation();
  const params = useParams<{ id?: string }>();
  const { getUserId, getToken, user } = useAuth();
  const { categories, loading: loadingCategories } = useCategories();

  const [serviceName, setServiceName] = useState(initialService?.title || "");
  const [categoryId, setCategoryId] = useState(initialService?.category_id || "");
  const [description, setDescription] = useState(initialService?.description || "");
  const [priceType, setPriceType] = useState<"hourly" | "per_job">("hourly");
  const [priceRange, setPriceRange] = useState("");
  const [yearsExperience, setYearsExperience] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const effectiveServiceId = serviceId || params.id;
  const serviceController = useMemo(() => new ServiceController(), []);

  useEffect(() => {
    const userId = getUserId();
    const token = getToken();

    if (!userId || !token) {
      navigate(ROUTES.PUBLIC.REGISTER, { replace: true });
      return;
    }

    // Autorrellenar categoría si viene initialService
    if (!categoryId && initialService?.category_id) {
      setCategoryId(initialService.category_id);
    }
  }, [getUserId, getToken, navigate, categoryId, initialService]);

  // Si venimos en modo edición y tenemos initialService, setear campos
  useEffect(() => {
    if (mode === "edit" && initialService) {
      setServiceName(initialService.title || "");
      setCategoryId(initialService.category_id || "");
      setDescription(initialService.description || "");
    }
  }, [mode, initialService]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    // Validaciones
    if (!serviceName.trim()) {
      setError("El nombre del servicio es obligatorio");
      return;
    }

    if (!categoryId) {
      setError("Debes seleccionar una categoría");
      return;
    }

    if (!description.trim()) {
      setError("La descripción es obligatoria");
      return;
    }

    if (priceType === "hourly" && !priceRange) {
      setError("Debes seleccionar un rango de precio por hora o seleccionar precio por obra");
      return;
    }

    if (!yearsExperience) {
      setError("Debes seleccionar tus años de experiencia");
      return;
    }

    setLoading(true);

    try {
      const finalUserId = getUserId();
      const finalToken = getToken();

      if (!finalUserId || !finalToken) {
        setError("Error de autenticación. Por favor inicia sesión nuevamente.");
        navigate(ROUTES.PUBLIC.LOGIN);
        return;
      }

      if (!isWorker(user?.role)) {
        setError("Solo los trabajadores pueden crear servicios. Por favor, verifica tu rol.");
        return;
      }

      if (mode === "edit") {
        const updateDto: UpdateServiceDto = {
          title: serviceName,
          description,
          category_id: categoryId,
          // Base price: usar priceRange como proxy si viene (promedio)
          base_price:
            priceType === "hourly" && priceRange
              ? (() => {
                  const [min, max] = priceRange.split("-").map(Number);
                  return max ? (min + max) / 2 : min;
                })()
              : undefined,
          is_available: true,
        };

        await serviceController.updateService(
          effectiveServiceId || "",
          updateDto,
          finalToken
        );

        navigate(`${ROUTES.DASHBOARD.SERVICES}?success=${encodeURIComponent("Servicio actualizado.")}`, {
          replace: true,
        });
      } else {
        const response = await serviceController.createBasicService({
          userId: finalUserId,
          category_id: categoryId,
          title: serviceName,
          description: description,
          price_type: priceType,
          price_range: priceType === "hourly" ? priceRange : undefined,
          years_experience: yearsExperience,
        }, finalToken);

        // Redirigir al dashboard de servicios después de crear el servicio exitosamente
        navigate(`${ROUTES.DASHBOARD.SERVICES}?success=${encodeURIComponent("Servicio creado exitosamente. ¡Ya puedes comenzar a recibir solicitudes!")}`, { 
          replace: true 
        });
      }
    } catch (err) {
      if (err instanceof Error) {
        setError(err.message);
      } else {
        setError("Error al crear servicio. Por favor intenta nuevamente.");
      }
    } finally {
      setLoading(false);
    }
  };

  const handleCancel = () => {
    // Redirigir a servicios si está en dashboard, sino a login
    if (location.pathname.includes('/dashboard')) {
      navigate(ROUTES.DASHBOARD.SERVICES);
    } else {
      navigate(ROUTES.PUBLIC.LOGIN, { replace: true });
    }
  };

  // Verificar si tenemos userId y token antes de renderizar
  const finalUserId = getUserId();
  const finalToken = getToken();

  if (!finalUserId || !finalToken) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Card className="p-8">
          <Alert variant="destructive">
            No se encontraron credenciales. Redirigiendo al registro...
          </Alert>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex bg-background">
      {/* Panel Izquierdo - Información y Navegación */}
      <div className="hidden md:flex flex-col justify-between px-8 py-6 bg-secondary border-r border-border w-96">
        <div>
          {/* Logo */}
          <div className="mb-8 mt-8">
            <div className="flex items-center gap-2 mb-6">
              <div className="w-10 h-10 bg-primary rounded-lg flex items-center justify-center">
                <svg
                  className="w-6 h-6 text-primary-foreground"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"
                  />
                </svg>
              </div>
              <span className="text-2xl font-bold text-primary">PARA SERVIR</span>
            </div>
          </div>

          {/* Indicador de Progreso */}
          <div className="mb-8">
            <div className="flex gap-2 mb-2">
              <div className="w-8 h-8 bg-primary rounded"></div>
              <div className="w-8 h-8 bg-muted rounded"></div>
              <div className="w-8 h-8 bg-muted rounded"></div>
              <div className="w-8 h-8 bg-muted rounded"></div>
            </div>
            <p className="text-sm text-text-secondary">Paso 1 de 4</p>
          </div>

          {/* Información Principal */}
          <div className="mb-8">
            <h2 className="text-2xl font-semibold text-foreground mb-4 leading-tight">
              Necesitamos información sobre tus servicios a prestar
            </h2>
            <p className="text-sm text-text-secondary leading-relaxed">
              Necesitamos estos datos para poder brindarte fácilmente soluciones
            </p>
          </div>
        </div>

        {/* Botones de Acción */}
        <div className="flex gap-4 mb-8">
          <Button
            type="button"
            variant="outline"
            onClick={handleCancel}
            className="flex-1"
          >
            Cancelar
          </Button>
          <Button
            type="submit"
            form="service-form"
            className="flex-1"
            disabled={loading}
          >
            Continuar
          </Button>
        </div>
      </div>

      {/* Panel Derecho - Formulario */}
      <div className="flex-1 flex flex-col px-8 py-6 max-w-2xl mx-auto">
        <div className="mb-8 mt-8">
          <h1 className="text-2xl font-semibold text-foreground mb-6 leading-tight">
            Ingresa el nombre de tu servicio
          </h1>
        </div>

        <Card className="p-8 shadow-md border border-border">
          <form id="service-form" onSubmit={handleSubmit} className="space-y-6">
            {error && <Alert variant="destructive">{error}</Alert>}

            {/* Nombre del Servicio */}
            <div>
              <Label htmlFor="serviceName" className="font-medium text-foreground">
                Nombre del servicio <span className="text-destructive">*</span>
              </Label>
              <Input
                id="serviceName"
                name="serviceName"
                type="text"
                value={serviceName}
                onChange={(e) => setServiceName(e.target.value)}
                placeholder="Carpinteria"
                className="mt-1"
                required
              />
            </div>

            {/* Categoría */}
            <div>
              <Label htmlFor="category" className="font-medium text-foreground">
                Categoría <span className="text-destructive">*</span>
              </Label>
              <Select
                value={categoryId}
                onValueChange={setCategoryId}
                disabled={loadingCategories}
              >
                <SelectTrigger id="category" className="mt-1" aria-label="Selecciona una categoría">
                  <SelectValue placeholder={loadingCategories ? "Cargando..." : "Selecciona una categoría"} />
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

            {/* Descripción */}
            <div>
              <Label htmlFor="description" className="font-medium text-foreground">
                Descripción <span className="text-destructive">*</span>
              </Label>
              <Textarea
                id="description"
                name="description"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Arreglo todo tipo de cosas que se tenga q ver con madera"
                className="mt-1"
                rows={4}
                required
              />
            </div>

            {/* Precio por Hora */}
            <div>
              <Label id="price-hourly-label" htmlFor="price-hourly" className="font-medium text-foreground mb-3 block">
                Precio la hora
              </Label>
              <div className="flex flex-wrap gap-3" role="group" aria-labelledby="price-hourly-label">
                <SelectionButton
                  name="price-range"
                  value="1-3"
                  selected={priceType === "hourly" && priceRange === "1-3"}
                  onSelect={(value) => {
                    setPriceType("hourly");
                    setPriceRange(value);
                  }}
                  disabled={priceType === "per_job"}
                >
                  1-3 $
                </SelectionButton>
                <SelectionButton
                  name="price-range"
                  value="3-6"
                  selected={priceType === "hourly" && priceRange === "3-6"}
                  onSelect={(value) => {
                    setPriceType("hourly");
                    setPriceRange(value);
                  }}
                  disabled={priceType === "per_job"}
                >
                  3-6 $
                </SelectionButton>
                <SelectionButton
                  name="price-range"
                  value="6-9"
                  selected={priceType === "hourly" && priceRange === "6-9"}
                  onSelect={(value) => {
                    setPriceType("hourly");
                    setPriceRange(value);
                  }}
                  disabled={priceType === "per_job"}
                >
                  6-9 $
                </SelectionButton>
                <SelectionButton
                  name="price-range"
                  value="9+"
                  selected={priceType === "hourly" && priceRange === "9+"}
                  onSelect={(value) => {
                    setPriceType("hourly");
                    setPriceRange(value);
                  }}
                  disabled={priceType === "per_job"}
                >
                  9-...
                </SelectionButton>
              </div>
            </div>

            {/* Precio por Obra */}
            <div className="mt-4">
              <Label htmlFor="price-per-job" className="font-medium text-foreground mb-3 block">
                Precio por obra
              </Label>
              <SelectionButton
                id="price-per-job"
                name="price-type"
                value="per_job"
                selected={priceType === "per_job"}
                onSelect={() => {
                  if (priceType === "per_job") {
                    setPriceType("hourly");
                    setPriceRange("");
                  } else {
                    setPriceType("per_job");
                    setPriceRange("");
                  }
                }}
              >
                Precio por obra
              </SelectionButton>
            </div>

            {/* Años de Experiencia */}
            <div>
              <Label id="yearsExperience-label" htmlFor="yearsExperience" className="font-medium text-foreground mb-3 block">
                Años de experiencia <span className="text-destructive">*</span>
              </Label>
              <div className="flex flex-wrap gap-3" role="group" aria-labelledby="yearsExperience-label">
                <SelectionButton
                  name="yearsExperience"
                  value="1-10"
                  selected={yearsExperience === "1-10"}
                  onSelect={setYearsExperience}
                >
                  1-10
                </SelectionButton>
                <SelectionButton
                  name="yearsExperience"
                  value="11-50"
                  selected={yearsExperience === "11-50"}
                  onSelect={setYearsExperience}
                >
                  11-50
                </SelectionButton>
                <SelectionButton
                  name="yearsExperience"
                  value="51-100"
                  selected={yearsExperience === "51-100"}
                  onSelect={setYearsExperience}
                >
                  51-100
                </SelectionButton>
                <SelectionButton
                  name="yearsExperience"
                  value="101-200"
                  selected={yearsExperience === "101-200"}
                  onSelect={setYearsExperience}
                >
                  101-200
                </SelectionButton>
                <SelectionButton
                  name="yearsExperience"
                  value="201-500"
                  selected={yearsExperience === "201-500"}
                  onSelect={setYearsExperience}
                >
                  201-500
                </SelectionButton>
                <SelectionButton
                  name="yearsExperience"
                  value="500+"
                  selected={yearsExperience === "500+"}
                  onSelect={setYearsExperience}
                >
                  500+
                </SelectionButton>
              </div>
            </div>

            {/* Botones para móvil */}
            <div className="md:hidden flex gap-4 pt-4">
              <Button
                type="button"
                variant="outline"
                onClick={handleCancel}
                className="flex-1"
              >
                Cancelar
              </Button>
              <Button
                type="submit"
                className="flex-1"
                disabled={loading || loadingCategories}
              >
                {loading ? "Guardando..." : "Continuar"}
              </Button>
            </div>
          </form>
        </Card>
      </div>
    </div>
  );
}
