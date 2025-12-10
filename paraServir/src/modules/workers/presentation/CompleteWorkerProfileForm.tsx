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
import {
  SelectTrigger,
  SelectValue,
  SelectContent,
  SelectItem
} from "@/shared/components/ui/select";
import { WorkerHttpController } from "@/modules/workers/infra/http/controllers/worker-http.controller";
import { ServiceCategoryController } from "@/modules/ServiceCategories/infra/http/controllers/service-category.controller";
import type { ServiceCategoryDto } from "@/modules/ServiceCategories/application/dto/service-category.dto";
import type { WorkerServiceDto } from "@/modules/workers/Application/dto/complete-worker-profile.dto";

interface ServiceForm {
  category_id: string;
  title: string;
  description: string;
  base_price: string;
}

export function CompleteWorkerProfileForm() {
  const location = useLocation();
  const navigate = useNavigate();
  
  // Obtener userId y token usando servicio centralizado
  const userId = location.state?.userId || AuthStorageService.getUserId() || "";
  const token = location.state?.token || AuthStorageService.getToken() || "";

  const [yearsExperience, setYearsExperience] = useState("");
  const [certificationUrl, setCertificationUrl] = useState("");
  const [services, setServices] = useState<ServiceForm[]>([
    { category_id: "", title: "", description: "", base_price: "" }
  ]);
  const [categories, setCategories] = useState<ServiceCategoryDto[]>([]);
  const [loading, setLoading] = useState(false);
  const [loadingCategories, setLoadingCategories] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const workerController = new WorkerHttpController();

  useEffect(() => {
    // Intentar obtener userId y token de diferentes fuentes
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

  const addService = () => {
    if (services.length >= 3) {
      setError("Máximo 3 servicios permitidos");
      return;
    }
    setServices([...services, { category_id: "", title: "", description: "", base_price: "" }]);
  };

  const removeService = (index: number) => {
    if (services.length === 1) {
      setError("Debes agregar al menos un servicio");
      return;
    }
    setServices(services.filter((_, i) => i !== index));
  };

  const updateService = (index: number, field: keyof ServiceForm, value: string) => {
    const updated = [...services];
    updated[index] = { ...updated[index], [field]: value };
    setServices(updated);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    // Validaciones
    if (!yearsExperience || parseInt(yearsExperience) < 0) {
      setError("Los años de experiencia deben ser un número válido");
      return;
    }

    if (services.length === 0) {
      setError("Debes agregar al menos un servicio");
      return;
    }

    if (services.length > 3) {
      setError("Máximo 3 servicios permitidos");
      return;
    }

    // Validar cada servicio
    for (let i = 0; i < services.length; i++) {
      const service = services[i];
      if (!service.category_id || !service.title || !service.description) {
        setError(`El servicio ${i + 1} tiene campos incompletos`);
        return;
      }
      const price = parseFloat(service.base_price);
      if (isNaN(price) || price < 0) {
        setError(`El precio del servicio ${i + 1} debe ser un número válido mayor o igual a 0`);
        return;
      }
    }

    setLoading(true);

    try {
      // Asegurar que tenemos userId y token
      const finalUserId = userId || location.state?.userId || AuthStorageService.getUserId() || "";
      const finalToken = token || location.state?.token || AuthStorageService.getToken() || "";

      if (!finalUserId || !finalToken) {
        setError("Error de autenticación. Por favor inicia sesión nuevamente.");
        navigate(ROUTES.PUBLIC.LOGIN);
        return;
      }

      const servicesDto: WorkerServiceDto[] = services.map(s => ({
        category_id: s.category_id,
        title: s.title,
        description: s.description,
        base_price: parseFloat(s.base_price),
      }));

      await workerController.completeProfile({
        userId: finalUserId,
        years_experience: parseInt(yearsExperience),
        certification_url: certificationUrl || null,
        services: servicesDto,
      }, finalToken);

      // Redirigir a home o dashboard
      navigate(ROUTES.PUBLIC.HOME, { replace: true });
    } catch (err) {
      if (err instanceof Error) {
        setError(err.message);
      } else {
        setError("Error al completar perfil. Por favor intenta nuevamente.");
      }
    } finally {
      setLoading(false);
    }
  };

  // Verificar si tenemos userId y token antes de renderizar
  const finalUserId = userId || location.state?.userId || localStorage.getItem("userId") || "";
  const finalToken = token || location.state?.token || localStorage.getItem("token") || "";

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
      <div className="flex-1 flex flex-col justify-between px-8 py-6 max-w-4xl mx-auto">
        <div>
          <div className="mb-8 mt-8">
            <div className="mb-2 text-3xl font-bold text-gray-800 leading-tight">
              Completa tu Perfil de Trabajador
            </div>
            <div className="mt-4 mb-2 text-base text-gray-700">
              Agrega tu experiencia y los servicios que ofreces (máximo 3)
            </div>
          </div>

          <Card className="p-8 shadow-lg border-2 border-blue-500 bg-white">
            <form onSubmit={handleSubmit} className="space-y-6">
              {error && <Alert variant="destructive">{error}</Alert>}

              <div>
                <Label htmlFor="yearsExperience" className="font-medium text-gray-700">
                  Años de Experiencia <span className="text-red-500">*</span>
                </Label>
                <Input
                  id="yearsExperience"
                  type="number"
                  min="0"
                  value={yearsExperience}
                  onChange={e => setYearsExperience(e.target.value)}
                  placeholder="5"
                  className="mt-1 border-gray-300 focus:border-blue-500 focus:ring-blue-500"
                  required
                />
              </div>

              <div>
                <Label htmlFor="certificationUrl" className="font-medium text-gray-700">
                  URL de Certificación (Opcional)
                </Label>
                <Input
                  id="certificationUrl"
                  type="url"
                  value={certificationUrl}
                  onChange={e => setCertificationUrl(e.target.value)}
                  placeholder="https://ejemplo.com/certificado.pdf"
                  className="mt-1 border-gray-300 focus:border-blue-500 focus:ring-blue-500"
                />
              </div>

              <div className="border-t pt-6">
                <div className="flex items-center justify-between mb-4">
                  <Label className="font-medium text-gray-700 text-lg">
                    Servicios que Ofreces <span className="text-red-500">*</span>
                  </Label>
                  <div className="text-sm text-gray-600">
                    {services.length}/3 servicios
                  </div>
                </div>

                {services.map((service, index) => (
                  <Card key={index} className="p-4 mb-4 border border-gray-200">
                    <div className="flex items-center justify-between mb-4">
                      <h3 className="font-medium text-gray-700">Servicio {index + 1}</h3>
                      {services.length > 1 && (
                        <Button
                          type="button"
                          variant="outline"
                          size="sm"
                          onClick={() => removeService(index)}
                          className="text-red-600 hover:text-red-700"
                        >
                          Eliminar
                        </Button>
                      )}
                    </div>

                    <div className="space-y-4">
                      <div>
                        <Label className="font-medium text-gray-700">
                          Categoría <span className="text-red-500">*</span>
                        </Label>
                        <Select
                          value={service.category_id}
                          onValueChange={(value) => updateService(index, "category_id", value)}
                          disabled={loadingCategories}
                        >
                          <SelectTrigger className="mt-1 border-gray-300 focus:border-blue-500 focus:ring-blue-500 bg-white">
                            <SelectValue placeholder={loadingCategories ? "Cargando..." : "Selecciona una categoría"} />
                          </SelectTrigger>
                          <SelectContent className="z-[9999] bg-white border-gray-200 shadow-xl max-h-[200px]">
                            {categories.map((cat) => (
                              <SelectItem key={cat.id} value={cat.id}>
                                {cat.name}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>

                      <div>
                        <Label className="font-medium text-gray-700">
                          Título del Servicio <span className="text-red-500">*</span>
                        </Label>
                        <Input
                          value={service.title}
                          onChange={e => updateService(index, "title", e.target.value)}
                          placeholder="Ej: Muebles a medida"
                          className="mt-1 border-gray-300 focus:border-blue-500 focus:ring-blue-500"
                          required
                        />
                      </div>

                      <div>
                        <Label className="font-medium text-gray-700">
                          Descripción <span className="text-red-500">*</span>
                        </Label>
                        <Textarea
                          value={service.description}
                          onChange={e => updateService(index, "description", e.target.value)}
                          placeholder="Describe tu servicio..."
                          className="mt-1 border-gray-300 focus:border-blue-500 focus:ring-blue-500"
                          rows={3}
                          required
                        />
                      </div>

                      <div>
                        <Label className="font-medium text-gray-700">
                          Precio Base <span className="text-red-500">*</span>
                        </Label>
                        <Input
                          type="number"
                          min="0"
                          step="0.01"
                          value={service.base_price}
                          onChange={e => updateService(index, "base_price", e.target.value)}
                          placeholder="80.00"
                          className="mt-1 border-gray-300 focus:border-blue-500 focus:ring-blue-500"
                          required
                        />
                      </div>
                    </div>
                  </Card>
                ))}

                {services.length < 3 && (
                  <Button
                    type="button"
                    variant="outline"
                    onClick={addService}
                    className="w-full border-blue-500 text-blue-600 hover:bg-blue-50"
                  >
                    + Agregar Otro Servicio
                  </Button>
                )}
              </div>

              <div className="flex gap-4 pt-4">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => navigate(ROUTES.PUBLIC.HOME)}
                  className="flex-1"
                >
                  Completar Después
                </Button>
                <Button
                  type="submit"
                  className="flex-1 bg-blue-600 hover:bg-blue-700 text-white font-medium py-2"
                  disabled={loading || loadingCategories}
                >
                  {loading ? "Guardando..." : "Completar Perfil"}
                </Button>
              </div>
            </form>
          </Card>
        </div>
      </div>
    </div>
  );
}

