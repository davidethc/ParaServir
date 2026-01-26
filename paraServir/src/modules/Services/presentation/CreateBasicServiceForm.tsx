import { useState, useEffect, useMemo } from "react";
import { useNavigate, useParams, useLocation } from "react-router-dom";
import { ROUTES } from "@/shared/constants/routes.constants";
import { Input } from "@/shared/components/ui/input";
import { Select } from "@/shared/components/ui/select";
import { Button } from "@/shared/components/ui/button";
import { Card, CardContent } from "@/shared/components/ui/card";
import { Label } from "@/shared/components/ui/label";
import { Alert } from "@/shared/components/ui/alert";
import { Textarea } from "@/shared/components/ui/textarea";
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
import { useGeolocation } from "@/shared/hooks/useGeolocation";
import { MapPin, Navigation, Search, Loader2, DollarSign, Clock, Award, Briefcase, CheckCircle2, ArrowRight, ArrowLeft, Sparkles } from "lucide-react";
import { HttpClientService } from "@/shared/services/http-client.service";
import { API_CONFIG } from "@/modules/Reviews/infra/http/api.config";

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

  const [currentStep, setCurrentStep] = useState(1);
  const totalSteps = 3;
  
  const [serviceName, setServiceName] = useState(initialService?.title || "");
  const [categoryId, setCategoryId] = useState(initialService?.category_id || "");
  const [description, setDescription] = useState(initialService?.description || "");
  const [priceType, setPriceType] = useState<"hourly" | "per_job">("hourly");
  const [priceRange, setPriceRange] = useState("");
  const [yearsExperience, setYearsExperience] = useState("");
  const [address, setAddress] = useState("");
  const [latitude, setLatitude] = useState<number | null>(null);
  const [longitude, setLongitude] = useState<number | null>(null);
  const [gettingLocation, setGettingLocation] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [categorySearch, setCategorySearch] = useState("");
  
  const { getCurrentLocation, updateLocation } = useGeolocation();

  const effectiveServiceId = serviceId || params.id;
  const serviceController = useMemo(() => new ServiceController(), []);

  // Función para reverse geocoding: convertir coordenadas a dirección
  const reverseGeocode = async (latitude: number, longitude: number): Promise<string | null> => {
    try {
      const response = await fetch(
        `https://nominatim.openstreetmap.org/reverse?lat=${latitude}&lon=${longitude}&format=json&addressdetails=1`,
        {
          headers: {
            'User-Agent': 'ParaServir-App/1.0'
          }
        }
      );

      if (!response.ok) {
        throw new Error('Error al obtener la dirección');
      }

      const data = await response.json();
      
      if (data && data.address) {
        // Construir dirección legible con calle, ciudad, etc.
        const address = data.address;
        let formattedAddress = '';
        
        // Priorizar: calle > ciudad > estado > país
        if (address.road || address.street) {
          formattedAddress += (address.road || address.street) + ', ';
        }
        if (address.neighbourhood || address.suburb) {
          formattedAddress += (address.neighbourhood || address.suburb) + ', ';
        }
        if (address.city || address.town || address.village) {
          formattedAddress += (address.city || address.town || address.village);
        } else if (address.state) {
          formattedAddress += address.state;
        }
        if (address.country) {
          if (formattedAddress) formattedAddress += ', ';
          formattedAddress += address.country;
        }

        // Si no hay dirección formateada, usar display_name completo
        return formattedAddress.trim() || data.display_name || null;
      }
      
      return null;
    } catch (err) {
      console.error('Error en reverse geocoding:', err);
      return null;
    }
  };

  useEffect(() => {
    const userId = getUserId();
    const token = getToken();

    if (!userId || !token) {
      navigate(ROUTES.PUBLIC.REGISTER, { replace: true });
      return;
    }

    // Autorrellenar categoría si viene initialService (solo una vez)
    if (!categoryId && initialService?.category_id) {
      setCategoryId(initialService.category_id);
    }

    // Cargar ubicación actual del usuario si existe
    const loadUserLocation = async () => {
      try {
        const httpClient = new HttpClientService({ baseUrl: API_CONFIG.baseUrl });
        const response = await httpClient.get<{ status: string; user: { latitude?: number; longitude?: number; location?: string } }>(
          '/users/me',
          { Authorization: `Bearer ${token}` }
        );
        if (response && response.user?.latitude && response.user?.longitude) {
          // Asegurar que sean números
          const lat = typeof response.user.latitude === 'string' 
            ? parseFloat(response.user.latitude) 
            : response.user.latitude;
          const lng = typeof response.user.longitude === 'string' 
            ? parseFloat(response.user.longitude) 
            : response.user.longitude;
          
          if (!isNaN(lat) && !isNaN(lng)) {
            setLatitude(lat);
            setLongitude(lng);
          }
          
          if (response.user.location) {
            setAddress(response.user.location);
          }
        }
      } catch (err) {
        // Si falla, continuar sin ubicación (el usuario la deberá ingresar)
        console.error('Error al cargar ubicación:', err);
      }
    };
    loadUserLocation();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Si venimos en modo edición y tenemos initialService, setear campos
  useEffect(() => {
    if (mode === "edit" && initialService) {
      setServiceName(initialService.title || "");
      setCategoryId(initialService.category_id || "");
      setDescription(initialService.description || "");
    }
  }, [mode, initialService]);

  // Validación por pasos
  const validateStep = (step: number): boolean => {
    setError(null);
    
    if (step === 1) {
      if (!serviceName.trim()) {
        setError("El nombre del servicio es obligatorio");
        return false;
      }
      if (!categoryId) {
        setError("Debes seleccionar una categoría");
        return false;
      }
      if (!description.trim()) {
        setError("La descripción es obligatoria");
        return false;
      }
      return true;
    }
    
    if (step === 2) {
      if (priceType === "hourly" && !priceRange) {
        setError("Debes seleccionar un rango de precio por hora o seleccionar precio por obra");
        return false;
      }
      if (!yearsExperience) {
        setError("Debes seleccionar tus años de experiencia");
        return false;
      }
      return true;
    }
    
    if (step === 3) {
      if (!address && (!latitude || !longitude)) {
        setError("Debes proporcionar tu ubicación. Usa el botón 'Mi ubicación' o escribe tu dirección manualmente.");
        return false;
      }
      return true;
    }
    
    return true;
  };

  const handleNext = () => {
    if (validateStep(currentStep)) {
      if (currentStep < totalSteps) {
        setCurrentStep(currentStep + 1);
        // Scroll al inicio del formulario
        window.scrollTo({ top: 0, behavior: 'smooth' });
      }
    }
  };

  const handlePrevious = () => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1);
      setError(null);
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    // Validar todos los pasos antes de enviar
    if (!validateStep(1) || !validateStep(2) || !validateStep(3)) {
      // Ir al primer paso con error
      if (!serviceName.trim() || !categoryId || !description.trim()) {
        setCurrentStep(1);
      } else if ((priceType === "hourly" && !priceRange) || !yearsExperience) {
        setCurrentStep(2);
      } else {
        setCurrentStep(3);
      }
      return;
    }

    setLoading(true);

    try {
      const finalUserId = getUserId();
      const finalToken = getToken();

      if (!finalUserId || !finalToken) {
        setError("Error de autenticación. Por favor inicia sesión nuevamente.");
        setLoading(false);
        navigate(ROUTES.PUBLIC.LOGIN, { replace: true });
        return;
      }

      if (!isWorker(user?.role)) {
        setError("Solo los trabajadores pueden crear servicios. Por favor, verifica tu rol.");
        setLoading(false);
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
        // Actualizar ubicación primero si es necesario
        if (address || (latitude && longitude)) {
          try {
            await updateLocation({
              address: address || undefined,
              latitude: latitude || undefined,
              longitude: longitude || undefined,
            });
          } catch (locError) {
            console.error('Error al actualizar ubicación:', locError);
            // Continuar de todas formas, el backend intentará geocodificar
          }
        }

        try {
          await serviceController.createBasicService({
            userId: finalUserId,
            category_id: categoryId,
            title: serviceName,
            description: description,
            price_type: priceType,
            price_range: priceType === "hourly" ? priceRange : undefined,
            years_experience: yearsExperience,
            address: address || undefined,
            latitude: latitude || undefined,
            longitude: longitude || undefined,
          }, finalToken);

          // Redirigir al dashboard de servicios después de crear el servicio exitosamente
          // Mostrar mensaje de éxito y llevar al trabajador a ver su servicio creado
          navigate(`${ROUTES.DASHBOARD.SERVICES}?success=${encodeURIComponent("¡Servicio creado exitosamente! Ya puedes comenzar a recibir solicitudes.")}`, { 
            replace: true 
          });
        } catch (serviceError) {
          // Manejar errores específicos de creación de servicio
          if (serviceError instanceof Error) {
            if (serviceError.message.includes('ubicación') || serviceError.message.includes('location')) {
              setError("Debes configurar tu ubicación. Por favor usa el botón 'Mi ubicación' o escribe tu dirección manualmente.");
            } else if (serviceError.message.includes('categoría') || serviceError.message.includes('category')) {
              setError("Debes seleccionar una categoría válida.");
            } else if (serviceError.message.includes('permisos') || serviceError.message.includes('403')) {
              setError("No tienes permisos para crear servicios. Asegúrate de estar registrado como trabajador.");
            } else {
              setError(serviceError.message || "Error al crear servicio. Por favor verifica todos los campos e intenta nuevamente.");
            }
          } else {
            setError("Error al crear servicio. Por favor intenta nuevamente.");
          }
          throw serviceError; // Re-lanzar para que el catch externo lo maneje
        }
      }
    } catch (err) {
      console.error('Error completo al crear servicio:', err);
      if (err instanceof Error) {
        // El error ya fue manejado específicamente en el bloque try interno
        // Solo mostrar si no se estableció un error más específico
        if (!error) {
          setError(err.message || "Error al crear servicio. Por favor intenta nuevamente.");
        }
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

  // Detectar si estamos dentro del dashboard para no mostrar doble sidebar
  const isInDashboard = location.pathname.includes('/dashboard');
  
  // Configuración de pasos
  const steps = [
    {
      number: 1,
      title: "Información Básica",
      description: "Nombre, categoría y descripción de tu servicio",
      icon: Briefcase
    },
    {
      number: 2,
      title: "Precios y Experiencia",
      description: "Define cómo cobras y tu nivel de experiencia",
      icon: DollarSign
    },
    {
      number: 3,
      title: "Ubicación",
      description: "Dónde ofreces tus servicios",
      icon: MapPin
    }
  ];

  const getStepTitle = () => {
    switch(currentStep) {
      case 1: return "Cuéntanos sobre tu servicio";
      case 2: return "Define tus precios y experiencia";
      case 3: return "¿Dónde ofreces tus servicios?";
      default: return "Crear servicio";
    }
  };

  const getStepDescription = () => {
    switch(currentStep) {
      case 1: return "Comienza con la información esencial que los clientes verán primero";
      case 2: return "Establece cómo quieres cobrar y muestra tu nivel de experiencia";
      case 3: return "Ayuda a los clientes a encontrarte fácilmente";
      default: return "";
    }
  };
  
  return (
    <div className={`min-h-screen flex flex-col bg-background ${isInDashboard ? '' : ''}`}>
      {/* Header con indicador de progreso */}
      <div className={`${isInDashboard ? 'px-4 lg:px-8 xl:px-12' : 'px-6 lg:px-12 xl:px-16'} pt-6 pb-4 border-b border-border bg-card/50`}>
        <div className="max-w-4xl mx-auto">
          {/* Indicador de pasos */}
          <div className="flex items-center justify-between mb-6">
            {steps.map((step, index) => {
              const StepIcon = step.icon;
              const isActive = currentStep === step.number;
              const isCompleted = currentStep > step.number;
              const isLast = index === steps.length - 1;
              
              return (
                <div key={step.number} className="flex items-center flex-1">
                  <div className="flex flex-col items-center flex-1">
                    {/* Círculo del paso */}
                    <div className="relative">
                      <div className={`
                        w-10 h-10 md:w-12 md:h-12 rounded-full flex items-center justify-center transition-all duration-300
                        ${isCompleted 
                          ? 'bg-gradient-to-br from-[#58A3B0] to-[#5877B0] text-white shadow-lg scale-110' 
                          : isActive
                          ? 'bg-gradient-to-br from-[#58A3B0] to-[#5877B0] text-white shadow-lg scale-110 ring-4 ring-[#58A3B0]/20'
                          : 'bg-muted text-muted-foreground'
                        }
                      `}>
                        {isCompleted ? (
                          <CheckCircle2 className="w-5 h-5 md:w-6 md:h-6" />
                        ) : (
                          <StepIcon className="w-4 h-4 md:w-5 md:h-5" />
                        )}
                      </div>
                      {/* Número del paso */}
                      {!isCompleted && (
                        <div className="absolute -bottom-0.5 -right-0.5 md:-bottom-1 md:-right-1 w-4 h-4 md:w-5 md:h-5 bg-background border-2 border-current rounded-full flex items-center justify-center text-[10px] md:text-xs font-bold">
                          {step.number}
                        </div>
                      )}
                    </div>
                    
                    {/* Texto del paso - visible en desktop */}
                    <div className="hidden md:block mt-3 text-center max-w-[120px]">
                      <p className={`text-xs font-semibold ${isActive ? 'text-foreground' : 'text-muted-foreground'}`}>
                        {step.title}
                      </p>
                    </div>
                  </div>
                  
                  {/* Línea conectora */}
                  {!isLast && (
                    <div className={`
                      flex-1 h-0.5 mx-2 md:mx-4 transition-all duration-300
                      ${isCompleted 
                        ? 'bg-gradient-to-r from-[#58A3B0] to-[#5877B0]' 
                        : currentStep > step.number
                        ? 'bg-gradient-to-r from-[#58A3B0] to-[#5877B0]'
                        : 'bg-muted'
                      }
                    `} />
                  )}
                </div>
              );
            })}
          </div>
          
          {/* Indicador móvil del paso actual */}
          <div className="md:hidden text-center mb-4">
            <p className="text-xs text-muted-foreground">
              Paso {currentStep} de {totalSteps}
            </p>
          </div>
          
          {/* Título y descripción del paso actual */}
          <div className="text-center">
            <h1 className="text-2xl lg:text-3xl font-bold text-foreground mb-2">
              {getStepTitle()}
            </h1>
            <p className="text-sm text-muted-foreground">
              {getStepDescription()}
            </p>
          </div>
        </div>
      </div>

      {/* Contenido del formulario */}
      <div className={`flex-1 flex flex-col ${isInDashboard ? 'px-4 lg:px-8 xl:px-12' : 'px-6 lg:px-12 xl:px-16'} py-8`}>
        <div className="max-w-3xl mx-auto w-full">

          <form id="service-form" onSubmit={handleSubmit} className="space-y-6">
            {error && (
              <Alert variant="destructive" className="py-3 text-sm animate-in slide-in-from-top-2">
                {error}
              </Alert>
            )}

            {/* PASO 1: Información Básica */}
            {currentStep === 1 && (
              <Card className="border-2 shadow-lg">
                <CardContent className="p-6 space-y-6">
                  {/* Nombre del Servicio */}
                  <div>
                    <Label htmlFor="serviceName" className="text-base font-semibold text-foreground mb-3 block flex items-center gap-2">
                      <Briefcase className="h-4 w-4 text-[#58A3B0]" />
                      Nombre del servicio <span className="text-destructive">*</span>
                    </Label>
                    <Input
                      id="serviceName"
                      name="serviceName"
                      type="text"
                      value={serviceName}
                      onChange={(e) => setServiceName(e.target.value)}
                      placeholder="Ej: Carpintería, Plomería, Electricista..."
                      className="h-12 text-base border-2 border-gray-200 rounded-xl bg-card text-foreground placeholder:text-muted-foreground/50 focus:border-[#58A3B0] focus:ring-2 focus:ring-[#58A3B0]/20 transition-all duration-200"
                      required
                      autoFocus
                    />
                    <p className="text-xs text-muted-foreground mt-2">
                      Un nombre claro ayuda a los clientes a encontrarte
                    </p>
                  </div>

                  {/* Categoría */}
                  <div>
                    <Label htmlFor="category" className="text-base font-semibold text-foreground mb-3 block flex items-center gap-2">
                      <Search className="h-4 w-4 text-[#58A3B0]" />
                      Categoría <span className="text-destructive">*</span>
                    </Label>
                    <Select
                      value={categoryId}
                      onValueChange={(value) => {
                        setCategoryId(value);
                        setCategorySearch("");
                      }}
                      disabled={loadingCategories}
                    >
                      <SelectTrigger id="category" className="h-12 text-base border-2 border-gray-200 rounded-xl bg-card text-foreground data-[placeholder]:text-muted-foreground/50 focus:border-[#58A3B0] focus:ring-2 focus:ring-[#58A3B0]/20 transition-all duration-200" aria-label="Selecciona una categoría">
                        <SelectValue placeholder={loadingCategories ? "Cargando..." : "Selecciona una categoría"} />
                      </SelectTrigger>
                      <SelectContent position="popper" className="max-h-[300px]">
                        <div className="sticky top-0 z-10 bg-card border-b border-border p-2">
                          <div className="relative">
                            <Search className="absolute left-2 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                            <Input
                              type="text"
                              placeholder="Buscar categoría..."
                              value={categorySearch}
                              onChange={(e) => setCategorySearch(e.target.value)}
                              className="pl-8 h-9 text-sm text-foreground placeholder:text-muted-foreground/50"
                              onClick={(e) => e.stopPropagation()}
                              onKeyDown={(e) => e.stopPropagation()}
                            />
                          </div>
                        </div>
                        <div className="max-h-[200px] overflow-y-auto">
                          {categories
                            .filter((cat) =>
                              cat.name.toLowerCase().includes(categorySearch.toLowerCase())
                            )
                            .map((cat) => (
                              <SelectItem key={cat.id} value={cat.id}>
                                {cat.name}
                              </SelectItem>
                            ))}
                          {categories.filter((cat) =>
                            cat.name.toLowerCase().includes(categorySearch.toLowerCase())
                          ).length === 0 && (
                            <div className="px-2 py-6 text-center text-sm text-muted-foreground">
                              No se encontraron categorías
                            </div>
                          )}
                        </div>
                      </SelectContent>
                    </Select>
                  </div>

                  {/* Descripción */}
                  <div>
                    <Label htmlFor="description" className="text-base font-semibold text-foreground mb-3 block">
                      Descripción <span className="text-destructive">*</span>
                    </Label>
                    <Textarea
                      id="description"
                      name="description"
                      value={description}
                      onChange={(e) => setDescription(e.target.value)}
                      placeholder="Describe qué servicios ofreces, tus especialidades, materiales que trabajas, experiencia destacada, etc..."
                      className="min-h-[140px] text-base border-2 border-gray-200 rounded-xl bg-card text-foreground placeholder:text-muted-foreground/50 focus:border-[#58A3B0] focus:ring-2 focus:ring-[#58A3B0]/20 resize-y transition-all duration-200"
                      rows={5}
                      required
                    />
                    <p className="text-xs text-muted-foreground mt-2 flex items-center gap-1">
                      <Sparkles className="h-3 w-3" />
                      Mientras más detallada sea tu descripción, más fácil será para los clientes encontrarte
                    </p>
                  </div>
                </CardContent>
              </Card>
            )}

            {/* PASO 2: Precios y Experiencia */}
            {currentStep === 2 && (
              <div className="space-y-6">
                {/* Precio */}
                <Card className="border-2 shadow-lg">
                  <CardContent className="p-6 space-y-6">
                    <div className="flex items-center gap-3 mb-2">
                      <DollarSign className="h-5 w-5 text-[#58A3B0]" />
                      <h3 className="text-xl font-bold text-foreground">
                        ¿Cómo quieres cobrar?
                      </h3>
                    </div>

                    {/* Opción 1: Precio por Hora */}
                    <div>
                      <Label className="text-base font-semibold text-foreground mb-4 block flex items-center gap-2">
                        <Clock className="h-4 w-4 text-[#58A3B0]" />
                        Precio por hora
                      </Label>
                      <div className="grid grid-cols-2 md:grid-cols-4 gap-3" role="group">
                        {[
                          { value: "1-3", label: "$1-3", desc: "Básico", color: "from-green-500 to-emerald-600" },
                          { value: "3-6", label: "$3-6", desc: "Intermedio", color: "from-blue-500 to-cyan-600" },
                          { value: "6-9", label: "$6-9", desc: "Avanzado", color: "from-purple-500 to-indigo-600" },
                          { value: "9+", label: "$9+", desc: "Premium", color: "from-orange-500 to-red-600" },
                        ].map((option) => {
                          const isSelected = priceType === "hourly" && priceRange === option.value;
                          return (
                            <button
                              key={option.value}
                              type="button"
                              onClick={() => {
                                setPriceType("hourly");
                                setPriceRange(option.value);
                              }}
                              disabled={priceType === "per_job"}
                              className={`
                                relative px-4 py-4 rounded-xl transition-all duration-200 border-2
                                ${isSelected 
                                  ? `bg-gradient-to-br ${option.color} text-white shadow-lg border-transparent font-medium scale-105` 
                                  : priceType === "per_job"
                                  ? 'bg-muted/10 text-muted-foreground cursor-not-allowed border-gray-200 opacity-50'
                                  : 'bg-card hover:bg-card/80 hover:border-[#58A3B0] text-foreground border-gray-200'
                                }
                              `}
                            >
                              {isSelected && (
                                <div className="absolute -top-2 -right-2 w-6 h-6 bg-white rounded-full flex items-center justify-center shadow-lg border-2 border-white">
                                  <CheckCircle2 className="w-4 h-4 text-green-600" />
                                </div>
                              )}
                              <div className="flex flex-col items-center gap-1">
                                <span className={`text-lg font-bold ${isSelected ? 'text-white' : 'text-[#58A3B0]'}`}>
                                  {option.label}
                                </span>
                                <span className={`text-xs ${isSelected ? 'text-white/90' : 'text-muted-foreground'}`}>
                                  {option.desc}
                                </span>
                              </div>
                            </button>
                          );
                        })}
                      </div>
                    </div>

                    {/* Opción 2: Precio por Obra */}
                    <div>
                      <Label className="text-base font-semibold text-foreground mb-4 block flex items-center gap-2">
                        <Briefcase className="h-4 w-4 text-[#58A3B0]" />
                        Precio por obra
                      </Label>
                      <button
                        type="button"
                        onClick={() => {
                          if (priceType === "per_job") {
                            setPriceType("hourly");
                            setPriceRange("");
                          } else {
                            setPriceType("per_job");
                            setPriceRange("");
                          }
                        }}
                        className={`
                          w-full px-6 py-5 rounded-xl transition-all duration-200 text-left border-2 flex items-center justify-between
                          ${priceType === "per_job" 
                            ? 'bg-gradient-to-br from-[#58A3B0] to-[#5877B0] text-white shadow-lg border-transparent font-medium scale-[1.02]' 
                            : 'bg-card hover:bg-card/80 hover:border-[#58A3B0] text-foreground border-gray-200'
                          }
                        `}
                      >
                        <div className="flex items-center gap-4">
                          <div className={`p-3 rounded-xl ${priceType === "per_job" ? 'bg-white/20' : 'bg-[#58A3B0]/10'}`}>
                            <Briefcase className={`h-5 w-5 ${priceType === "per_job" ? 'text-white' : 'text-[#58A3B0]'}`} />
                          </div>
                          <div>
                            <div className={`text-base font-bold ${priceType === "per_job" ? 'text-white' : 'text-foreground'}`}>
                              Precio por obra
                            </div>
                            <div className={`text-sm mt-1 ${priceType === "per_job" ? 'text-white/90' : 'text-muted-foreground'}`}>
                              Negocia el precio según el trabajo específico
                            </div>
                          </div>
                        </div>
                        {priceType === "per_job" && (
                          <CheckCircle2 className="w-6 h-6 text-white" />
                        )}
                      </button>
                    </div>
                  </CardContent>
                </Card>

                {/* Años de Experiencia */}
                <Card className="border-2 shadow-lg">
                  <CardContent className="p-6">
                    <div className="flex items-center gap-3 mb-6">
                      <Award className="h-5 w-5 text-[#58A3B0]" />
                      <h3 className="text-xl font-bold text-foreground">
                        Años de experiencia <span className="text-destructive">*</span>
                      </h3>
                    </div>
                    <div className="grid grid-cols-2 md:grid-cols-3 gap-3" role="group">
                      {[
                        { value: "1-2", label: "1-2", icon: "🌱", desc: "Iniciando" },
                        { value: "3-4", label: "3-4", icon: "⭐", desc: "Desarrollando" },
                        { value: "4-5", label: "4-5", icon: "🏆", desc: "Experto" },
                        { value: "5-6", label: "5-6", icon: "👑", desc: "Avanzado" },
                        { value: "10+", label: "10+", icon: "💎", desc: "Maestro" },
                      ].map((option) => {
                        const isSelected = yearsExperience === option.value;
                        return (
                          <button
                            key={option.value}
                            type="button"
                            onClick={() => setYearsExperience(option.value)}
                            className={`
                              relative px-4 py-4 rounded-xl transition-all duration-200 border-2 flex flex-col items-center gap-2
                              ${isSelected 
                                ? 'bg-gradient-to-br from-[#58A3B0] to-[#5877B0] text-white shadow-lg border-transparent font-medium scale-105' 
                                : 'bg-card hover:bg-card/80 hover:border-[#58A3B0] text-foreground border-gray-200'
                              }
                            `}
                          >
                            <span className={`text-2xl ${isSelected ? 'filter brightness-0 invert' : ''}`}>
                              {option.icon}
                            </span>
                            <div className="flex flex-col items-center">
                              <span className={`text-base font-bold ${isSelected ? 'text-white' : 'text-[#58A3B0]'}`}>
                                {option.label} años
                              </span>
                              <span className={`text-xs mt-0.5 ${isSelected ? 'text-white/90' : 'text-muted-foreground'}`}>
                                {option.desc}
                              </span>
                            </div>
                            {isSelected && (
                              <div className="absolute -top-2 -right-2 w-6 h-6 bg-white rounded-full flex items-center justify-center shadow-lg border-2 border-white">
                                <CheckCircle2 className="w-4 h-4 text-green-600" />
                              </div>
                            )}
                          </button>
                        );
                      })}
                    </div>
                  </CardContent>
                </Card>
              </div>
            )}

            {/* PASO 3: Ubicación */}
            {currentStep === 3 && (
              <Card className="border-2 shadow-lg">
                <CardContent className="p-6 space-y-6">
                  <div className="flex items-center gap-3 mb-2">
                    <MapPin className="h-5 w-5 text-[#58A3B0]" />
                    <h3 className="text-xl font-bold text-foreground">
                      ¿Dónde ofreces tus servicios? <span className="text-destructive">*</span>
                    </h3>
                  </div>
                  
                  <p className="text-sm text-muted-foreground mb-4">
                    Los clientes podrán encontrarte más fácilmente si compartes tu ubicación
                  </p>

                  <div className="space-y-4">
                    <div className="flex gap-3">
                      <div className="relative flex-1">
                        <MapPin className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
                        <Input
                          id="address"
                          type="text"
                          placeholder="Ej: Av. Principal 123, Quito, Ecuador"
                          value={address}
                          onChange={(e) => setAddress(e.target.value)}
                          onPaste={(e) => {
                            const pastedText = e.clipboardData.getData('text');
                            if (pastedText) {
                              setAddress(pastedText);
                            }
                          }}
                          className="pl-12 h-14 text-base border-2 border-gray-200 rounded-xl bg-card text-foreground placeholder:text-muted-foreground/50 focus:border-[#58A3B0] focus:ring-2 focus:ring-[#58A3B0]/20 transition-all duration-200"
                          autoFocus
                        />
                      </div>
                      <Button
                        type="button"
                        variant="outline"
                        onClick={async () => {
                          setGettingLocation(true);
                          setError(null);
                          try {
                            const coords = await getCurrentLocation();
                            setLatitude(coords.latitude);
                            setLongitude(coords.longitude);
                            
                            const address = await reverseGeocode(coords.latitude, coords.longitude);
                            
                            if (address) {
                              setAddress(address);
                            } else {
                              setError("No se pudo obtener la dirección. Puedes escribirla manualmente.");
                            }
                          } catch (err) {
                            setError(err instanceof Error ? err.message : "Error al obtener ubicación. Puedes escribirla manualmente.");
                          } finally {
                            setGettingLocation(false);
                          }
                        }}
                        disabled={gettingLocation}
                        className="h-14 px-6 border-2 border-[#58A3B0] bg-gradient-to-r from-[#58A3B0] to-[#5877B0] hover:from-[#5877B0] hover:to-[#58A3B0] text-white rounded-xl font-semibold text-base transition-all duration-200 shadow-md hover:shadow-lg"
                      >
                        {gettingLocation ? (
                          <>
                            <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                            <span>Obteniendo...</span>
                          </>
                        ) : (
                          <>
                            <Navigation className="h-4 w-4 mr-2" />
                            <span>Mi ubicación</span>
                          </>
                        )}
                      </Button>
                    </div>
                    
                    <div className="bg-muted/30 rounded-xl p-4 border border-border">
                      <div className="flex items-start gap-3">
                        <MapPin className="h-5 w-5 text-[#58A3B0] mt-0.5" />
                        <div>
                          <p className="text-sm font-medium text-foreground mb-1">
                            ¿Por qué necesitamos tu ubicación?
                          </p>
                          <p className="text-xs text-muted-foreground">
                            Esto ayuda a los clientes cercanos a encontrarte más fácilmente y te permite recibir solicitudes de tu zona.
                          </p>
                        </div>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Navegación entre pasos */}
            <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-4 pt-6 border-t border-border">
              <div className="flex items-center gap-3">
                {currentStep > 1 && (
                  <Button
                    type="button"
                    variant="outline"
                    onClick={handlePrevious}
                    className="flex-1 sm:flex-none px-6 h-12 border-2 border-gray-200 hover:bg-muted/50 hover:border-[#58A3B0] font-medium rounded-xl transition-all duration-200"
                  >
                    <ArrowLeft className="h-4 w-4 mr-2" />
                    Anterior
                  </Button>
                )}
                {currentStep < totalSteps && (
                  <Button
                    type="button"
                    onClick={handleNext}
                    className="flex-1 sm:flex-none px-8 h-12 bg-gradient-to-r from-[#58A3B0] to-[#5877B0] hover:from-[#5877B0] hover:to-[#58A3B0] text-white font-bold rounded-xl shadow-lg hover:shadow-xl transition-all duration-200"
                  >
                    Siguiente
                    <ArrowRight className="h-4 w-4 ml-2" />
                  </Button>
                )}
              </div>
              
              <div className="flex items-center gap-3">
                {currentStep === totalSteps && (
                  <Button
                    type="submit"
                    className="flex-1 sm:flex-none px-8 h-12 bg-gradient-to-r from-[#58A3B0] to-[#5877B0] hover:from-[#5877B0] hover:to-[#58A3B0] text-white font-bold rounded-xl shadow-lg hover:shadow-xl transition-all duration-200"
                    disabled={loading || loadingCategories}
                  >
                    {loading ? (
                      <>
                        <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                        Creando servicio...
                      </>
                    ) : (
                      <>
                        <Sparkles className="h-4 w-4 mr-2" />
                        Crear Servicio
                      </>
                    )}
                  </Button>
                )}
                <Button
                  type="button"
                  variant="outline"
                  onClick={handleCancel}
                  className="px-6 h-12 border-2 border-gray-200 hover:bg-muted/50 hover:border-gray-300 font-medium rounded-xl transition-all duration-200"
                >
                  Cancelar
                </Button>
              </div>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
