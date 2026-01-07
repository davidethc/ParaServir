import { useState, useEffect, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import { ROUTES } from "@/shared/constants/routes.constants";
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
import { ServiceController } from "@/modules/Services/infra/http/controllers/service.controller";
import type { WorkerServiceDto } from "@/modules/workers/Application/dto/complete-worker-profile.dto";
import { useCategories } from "@/shared/hooks/useCategories";
import { useAuth } from "@/shared/hooks/useAuth";
import { useMe } from "@/shared/hooks/useMe";
import { LoadingState } from "@/shared/components/feedback/LoadingState";

interface ServiceForm {
  category_id: string;
  title: string;
  description: string;
  base_price: string;
}

export function CompleteWorkerProfileForm() {
  const navigate = useNavigate();
  const { getUserId, getToken } = useAuth();
  const { categories, loading: loadingCategories, error: categoriesError } = useCategories();
  const { user: currentUser, loading: loadingUser, refetch: refetchUser } = useMe();

  const [yearsExperience, setYearsExperience] = useState("");
  const [certificationUrl, setCertificationUrl] = useState("");
  const [services, setServices] = useState<ServiceForm[]>([
    { category_id: "", title: "", description: "", base_price: "" }
  ]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [loadingExistingData, setLoadingExistingData] = useState(true);

  const workerController = useMemo(() => new WorkerHttpController(), []);
  const serviceController = useMemo(() => new ServiceController(), []);

  // Cargar datos existentes del trabajador
  useEffect(() => {
    const loadExistingData = async () => {
      if (!currentUser || currentUser.role !== "trabajador" || !currentUser.id) {
        setLoadingExistingData(false);
        return;
      }

      try {
        const token = getToken();
        if (!token) return;

        // Cargar perfil del trabajador (ya viene en useMe)
        if (currentUser.worker_profile) {
          setYearsExperience(currentUser.worker_profile.years_experience?.toString() || "");
          setCertificationUrl(currentUser.worker_profile.certification_url || "");
        }

        // Cargar servicios existentes
        const existingServices = await serviceController.getWorkerServices(currentUser.id, token);
        if (existingServices && existingServices.length > 0) {
          const serviceForms: ServiceForm[] = existingServices.map(s => ({
            category_id: s.category_id || "",
            title: s.title || "",
            description: s.description || "",
            base_price: s.base_price?.toString() || "",
          }));
          setServices(serviceForms);
        }
      } catch (err) {
        // No es crítico, continuar con formulario vacío
      } finally {
        setLoadingExistingData(false);
      }
    };

    if (!loadingUser && currentUser) {
      void loadExistingData();
    }
  }, [currentUser, loadingUser, getToken, serviceController]);

  useEffect(() => {
    const userId = getUserId();
    const token = getToken();

    if (!userId || !token) {
      navigate(ROUTES.PUBLIC.REGISTER, { replace: true });
      return;
    }

    if (categoriesError) {
      setError(categoriesError);
    }
  }, [getUserId, getToken, navigate, categoriesError]);

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
      const finalUserId = getUserId();
      const finalToken = getToken();

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

      // Actualizar datos del usuario para reflejar cambios
      await refetchUser();

      // Redirigir a dashboard de servicios
      navigate(ROUTES.DASHBOARD.SERVICES, { replace: true });
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

  if (loadingUser || loadingExistingData) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Card className="p-8">
          <LoadingState message="Cargando datos del perfil..." variant="list" count={3} />
        </Card>
      </div>
    );
  }

  const isEditing = currentUser?.worker_profile !== undefined;

  return (
    <div className="min-h-screen flex bg-background">
      <div className="flex-1 flex flex-col justify-between px-8 py-6 max-w-4xl mx-auto">
        <div>
          <div className="mb-8 mt-8">
            <div className="mb-2 text-3xl font-semibold text-foreground leading-tight">
              {isEditing ? "Editar Perfil de Trabajador" : "Completa tu Perfil de Trabajador"}
            </div>
            <div className="mt-4 mb-2 text-base text-text-secondary leading-relaxed">
              {isEditing 
                ? "Actualiza tu experiencia y los servicios que ofreces (máximo 3)"
                : "Agrega tu experiencia y los servicios que ofreces (máximo 3)"}
            </div>
          </div>

          <Card className="p-8 shadow-md border-2 border-primary">
            <form onSubmit={handleSubmit} className="space-y-6">
              {error && <Alert variant="destructive">{error}</Alert>}

              <div>
                <Label htmlFor="yearsExperience" className="font-medium text-foreground">
                  Años de Experiencia <span className="text-destructive">*</span>
                </Label>
                <Input
                  id="yearsExperience"
                  type="number"
                  min="0"
                  value={yearsExperience}
                  onChange={e => setYearsExperience(e.target.value)}
                  placeholder="5"
                  className="mt-1"
                  required
                />
              </div>

              <div>
                <Label htmlFor="certificationUrl" className="font-medium text-foreground">
                  URL de Certificación (Opcional)
                </Label>
                <Input
                  id="certificationUrl"
                  type="url"
                  value={certificationUrl}
                  onChange={e => setCertificationUrl(e.target.value)}
                  placeholder="https://ejemplo.com/certificado.pdf"
                  className="mt-1"
                />
              </div>

              <div className="border-t border-border pt-6">
                <div className="flex items-center justify-between mb-4">
                  <Label className="font-medium text-foreground text-lg">
                    Servicios que Ofreces <span className="text-destructive">*</span>
                  </Label>
                  <div className="text-sm text-text-secondary">
                    {services.length}/3 servicios
                  </div>
                </div>

                {services.map((service, index) => (
                  <Card key={index} className="p-4 mb-4 border border-border">
                    <div className="flex items-center justify-between mb-4">
                      <h3 className="font-medium text-foreground">Servicio {index + 1}</h3>
                      {services.length > 1 && (
                        <Button
                          type="button"
                          variant="outline"
                          size="sm"
                          onClick={() => removeService(index)}
                          className="text-destructive hover:text-destructive hover:bg-destructive-light"
                        >
                          Eliminar
                        </Button>
                      )}
                    </div>

                    <div className="space-y-4">
                      <div>
                        <Label className="font-medium text-foreground">
                          Categoría <span className="text-destructive">*</span>
                        </Label>
                        <Select
                          value={service.category_id}
                          onValueChange={(value) => updateService(index, "category_id", value)}
                          disabled={loadingCategories}
                        >
                          <SelectTrigger className="mt-1">
                            <SelectValue placeholder={loadingCategories ? "Cargando..." : "Selecciona una categoría"} />
                          </SelectTrigger>
                          <SelectContent position="popper" className="max-h-[200px]">
                            {categories.map((cat) => (
                              <SelectItem key={cat.id} value={cat.id}>
                                {cat.name}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>

                      <div>
                        <Label className="font-medium text-foreground">
                          Título del Servicio <span className="text-destructive">*</span>
                        </Label>
                        <Input
                          value={service.title}
                          onChange={e => updateService(index, "title", e.target.value)}
                          placeholder="Ej: Muebles a medida"
                          className="mt-1"
                          required
                        />
                      </div>

                      <div>
                        <Label className="font-medium text-foreground">
                          Descripción <span className="text-destructive">*</span>
                        </Label>
                        <Textarea
                          value={service.description}
                          onChange={e => updateService(index, "description", e.target.value)}
                          placeholder="Describe tu servicio..."
                          className="mt-1"
                          rows={3}
                          required
                        />
                      </div>

                      <div>
                        <Label className="font-medium text-foreground">
                          Precio Base <span className="text-destructive">*</span>
                        </Label>
                        <Input
                          type="number"
                          min="0"
                          step="0.01"
                          value={service.base_price}
                          onChange={e => updateService(index, "base_price", e.target.value)}
                          placeholder="80.00"
                          className="mt-1"
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
                    className="w-full"
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
                  className="flex-1 font-medium py-2"
                  disabled={loading || loadingCategories}
                >
                  {loading ? "Guardando..." : isEditing ? "Guardar Cambios" : "Completar Perfil"}
                </Button>
              </div>
            </form>
          </Card>
        </div>
      </div>
    </div>
  );
}

