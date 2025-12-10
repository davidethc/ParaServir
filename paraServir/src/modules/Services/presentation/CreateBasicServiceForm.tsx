import { useState, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { ROUTES } from "@/shared/constants/routes.constants";
import { AuthStorageService } from "@/shared/services/auth-storage.service";
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
import { ServiceCategoryController } from "@/modules/ServiceCategories/infra/http/controllers/service-category.controller";
import type { ServiceCategoryDto } from "@/modules/ServiceCategories/application/dto/service-category.dto";

export function CreateBasicServiceForm() {
  const location = useLocation();
  const navigate = useNavigate();
  
  // Obtener userId y token usando servicio centralizado
  const userId = location.state?.userId || AuthStorageService.getUserId() || "";
  const token = location.state?.token || AuthStorageService.getToken() || "";

  const [serviceName, setServiceName] = useState("");
  const [categoryId, setCategoryId] = useState("");
  const [description, setDescription] = useState("");
  const [priceType, setPriceType] = useState<"hourly" | "per_job">("hourly");
  const [priceRange, setPriceRange] = useState("");
  const [yearsExperience, setYearsExperience] = useState("");
  const [categories, setCategories] = useState<ServiceCategoryDto[]>([]);
  const [loading, setLoading] = useState(false);
  const [loadingCategories, setLoadingCategories] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const serviceController = new ServiceController();

  useEffect(() => {
    const finalUserId = userId || location.state?.userId || AuthStorageService.getUserId() || "";
    const finalToken = token || location.state?.token || AuthStorageService.getToken() || "";

    if (!finalUserId || !finalToken) {
      console.error("Missing userId or token:", { finalUserId, finalToken });
      navigate(ROUTES.PUBLIC.REGISTER, { replace: true });
      return;
    }

    // Cargar categorías
    const categoryController = new ServiceCategoryController();
    const loadCategories = async () => {
      try {
        const cats = await categoryController.getAllCategories();
        setCategories(cats);
      } catch (err) {
        console.error("Error loading categories:", err);
        if (err instanceof Error) {
          setError(err.message);
        } else {
          setError("Error al cargar categorías. Por favor verifica que el backend esté ejecutándose.");
        }
      } finally {
        setLoadingCategories(false);
      }
    };

    loadCategories();
  }, [userId, token, location.state, navigate]);

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
      const finalUserId = userId || location.state?.userId || AuthStorageService.getUserId() || "";
      const finalToken = token || location.state?.token || AuthStorageService.getToken() || "";
      const userRole = AuthStorageService.getUserRole();

      console.log("Creando servicio con:", {
        userId: finalUserId,
        tokenPresent: !!finalToken,
        tokenLength: finalToken.length,
        userRole: userRole,
        categoryId: categoryId,
        serviceName: serviceName
      });

      if (!finalUserId || !finalToken) {
        setError("Error de autenticación. Por favor inicia sesión nuevamente.");
        navigate(ROUTES.PUBLIC.LOGIN);
        return;
      }

      if (userRole !== "trabajador") {
        setError("Solo los trabajadores pueden crear servicios. Tu rol actual es: " + (userRole || "no definido"));
        return;
      }

      const response = await serviceController.createBasicService({
        userId: finalUserId,
        category_id: categoryId,
        title: serviceName,
        description: description,
        price_type: priceType,
        price_range: priceType === "hourly" ? priceRange : undefined,
        years_experience: yearsExperience,
      }, finalToken);

      console.log("Servicio creado exitosamente:", response);
      
      // Redirigir al dashboard después de crear el servicio exitosamente
      // Si el trabajador necesita completar su perfil, puede hacerlo desde el dashboard
      navigate(ROUTES.DASHBOARD.HOME, { 
        state: { 
          message: "Servicio creado exitosamente. ¡Ya puedes comenzar a recibir solicitudes!" 
        },
        replace: true 
      });
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
    // Limpiar datos y redirigir a login
    AuthStorageService.clearAuthData();
    navigate(ROUTES.PUBLIC.LOGIN, { replace: true });
  };

  // Verificar si tenemos userId y token antes de renderizar
  const finalUserId = userId || location.state?.userId || AuthStorageService.getUserId() || "";
  const finalToken = token || location.state?.token || AuthStorageService.getToken() || "";

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
    <div className="min-h-screen flex bg-white">
      {/* Panel Izquierdo - Información y Navegación */}
      <div className="hidden md:flex flex-col justify-between px-8 py-6 bg-gray-50 border-r border-gray-200 w-96">
        <div>
          {/* Logo */}
          <div className="mb-8 mt-8">
            <div className="flex items-center gap-2 mb-6">
              <div className="w-10 h-10 bg-blue-600 rounded-lg flex items-center justify-center">
                <svg
                  className="w-6 h-6 text-white"
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
              <span className="text-2xl font-bold text-blue-600">PARA SERVIR</span>
            </div>
          </div>

          {/* Indicador de Progreso */}
          <div className="mb-8">
            <div className="flex gap-2 mb-2">
              <div className="w-8 h-8 bg-red-600 rounded"></div>
              <div className="w-8 h-8 bg-gray-300 rounded"></div>
              <div className="w-8 h-8 bg-gray-300 rounded"></div>
              <div className="w-8 h-8 bg-gray-300 rounded"></div>
            </div>
            <p className="text-sm text-gray-600">Paso 1 de 4</p>
          </div>

          {/* Información Principal */}
          <div className="mb-8">
            <h2 className="text-2xl font-bold text-gray-900 mb-4">
              Necesitamos información sobre tus servicios a prestar
            </h2>
            <p className="text-sm text-gray-600">
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
            className="flex-1 border-gray-300 text-gray-700 hover:bg-gray-100"
          >
            Cancelar
          </Button>
          <Button
            type="submit"
            form="service-form"
            className="flex-1 bg-gray-900 hover:bg-gray-800 text-white"
            disabled={loading}
          >
            Continuar
          </Button>
        </div>
      </div>

      {/* Panel Derecho - Formulario */}
      <div className="flex-1 flex flex-col px-8 py-6 max-w-2xl mx-auto">
        <div className="mb-8 mt-8">
          <h1 className="text-2xl font-bold text-gray-900 mb-6">
            Ingresa el nombre de tu servicio
          </h1>
        </div>

        <Card className="p-8 shadow-lg border border-gray-200 bg-white">
          <form id="service-form" onSubmit={handleSubmit} className="space-y-6">
            {error && <Alert variant="destructive">{error}</Alert>}

            {/* Nombre del Servicio */}
            <div>
              <Label htmlFor="serviceName" className="font-medium text-gray-700">
                Nombre del servicio <span className="text-red-500">*</span>
              </Label>
              <Input
                id="serviceName"
                name="serviceName"
                type="text"
                value={serviceName}
                onChange={(e) => setServiceName(e.target.value)}
                placeholder="Carpinteria"
                className="mt-1 border-gray-300 focus:border-blue-500 focus:ring-blue-500"
                required
              />
            </div>

            {/* Categoría */}
            <div>
              <Label htmlFor="category" className="font-medium text-gray-700">
                Categoría <span className="text-red-500">*</span>
              </Label>
              <Select
                value={categoryId}
                onValueChange={setCategoryId}
                disabled={loadingCategories}
              >
                <SelectTrigger id="category" className="mt-1 border-gray-300 focus:border-blue-500 focus:ring-blue-500 bg-white" aria-label="Selecciona una categoría">
                  <SelectValue placeholder={loadingCategories ? "Cargando..." : "Selecciona una categoría"} />
                </SelectTrigger>
                <SelectContent className="z-[9999] bg-white border-gray-200 shadow-xl">
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
              <Label htmlFor="description" className="font-medium text-gray-700">
                Descripción <span className="text-red-500">*</span>
              </Label>
              <Textarea
                id="description"
                name="description"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Arreglo todo tipo de cosas que se tenga q ver con madera"
                className="mt-1 border-gray-300 focus:border-blue-500 focus:ring-blue-500"
                rows={4}
                required
              />
            </div>

            {/* Precio por Hora */}
            <div>
              <Label id="price-hourly-label" htmlFor="price-hourly" className="font-medium text-gray-700 mb-3 block">
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
              <Label htmlFor="price-per-job" className="font-medium text-gray-700 mb-3 block">
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
              <Label id="yearsExperience-label" htmlFor="yearsExperience" className="font-medium text-gray-700 mb-3 block">
                Años de experiencia <span className="text-red-500">*</span>
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
                className="flex-1 bg-gray-900 hover:bg-gray-800 text-white"
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
