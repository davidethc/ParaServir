import { useState, useEffect, useMemo } from "react";
import type { FormEvent } from "react";
import { Link, useNavigate } from "react-router-dom";
import { ROUTES } from "@/shared/constants/routes.constants";
import { useCategories } from "@/shared/hooks/useCategories";
import { AdvancedSearchWorkersUseCase } from "@/modules/workers/application/use-cases/advanced-search-workers.use-case";
import { ReviewController } from "@/modules/Reviews/infra/http/controllers/review.controller";
import type { WorkerProfileDto } from "@/modules/workers/application/dto/worker-profile.dto";
import type { AdvancedSearchFiltersState } from "@/modules/workers/presentation/components/AdvancedSearchFilters";
import { Button } from "@/shared/components/ui/button";
import { Input } from "@/shared/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/shared/components/ui/select";
// Card no se usa directamente, pero CategoryCard lo puede usar
import { CategoryCard } from "@/shared/components/cards/CategoryCard";
import { Badge } from "@/shared/components/ui/badge";
import { Avatar, AvatarImage, AvatarFallback } from "@/shared/components/ui/avatar";
import { 
  Search, 
  Wrench,
  MapPin,
  ArrowRight,
  Star,
  CheckCircle2,
  Lock,
  HeadphonesIcon,
  Calendar,
  MessageSquare,
  Facebook,
  Instagram
} from "lucide-react";
import { getWorkerAvatar } from "@/shared/utils/avatar-utils";
import { useAuth } from "@/shared/hooks/useAuth";

// Búsquedas populares
const POPULAR_SEARCHES = [
  { name: "Plomería", category: "plomeria" },
  { name: "Limpieza", category: "limpieza" },
  { name: "Electricista", category: "electricista" },
  { name: "Jardinería", category: "jardineria" },
];

export function HomePage() {
  const navigate = useNavigate();
  const { categories, loading: loadingCategories } = useCategories();
  const { getToken } = useAuth();

  // State para búsqueda
  const [searchCategory, setSearchCategory] = useState<string>("all");
  const [searchLocation, setSearchLocation] = useState<string>("");
  const [gettingLocation, setGettingLocation] = useState(false);
  const [locationError, setLocationError] = useState(false);

  // State para trabajador destacado
  const [featuredWorker, setFeaturedWorker] = useState<WorkerProfileDto | null>(null);
  const [featuredRating, setFeaturedRating] = useState<number>(0);

  // Controllers
  const workerSearchUseCase = useMemo(() => new AdvancedSearchWorkersUseCase(), []);
  const reviewController = useMemo(() => new ReviewController(), []);

  // Load featured worker
  useEffect(() => {
    const loadFeatured = async () => {
      try {
        const token = getToken();
        
        const filters: AdvancedSearchFiltersState = {
          searchTerm: "",
          categoryId: "all",
          location: "",
          latitude: null,
          longitude: null,
          radius: 50,
          minPrice: null,
          maxPrice: null,
          minRating: 4.5,
          minExperience: null,
          sortBy: "rating_desc",
        };

        const workers = await workerSearchUseCase.execute(filters, token || undefined);
        // Mostrar trabajadores que tengan servicios, sin importar verificación
        const activeWorkers = workers.filter(w => w.first_name && w.first_name.trim() !== '');
        
        if (activeWorkers.length > 0) {
          const worker = activeWorkers[0];
          setFeaturedWorker(worker);
          
          try {
            const reviews = await reviewController.getWorkerReviews(worker.id);
            setFeaturedRating(reviews.average_rating || 0);
          } catch {
            setFeaturedRating(0);
          }
        }
      } catch (err) {
        console.error("Error loading featured worker:", err);
      }
    };

    void loadFeatured();
  }, [workerSearchUseCase, reviewController, getToken]);

  // Obtener ubicación automáticamente al cargar
  useEffect(() => {
    const getCurrentLocationAuto = async () => {
      if (!navigator.geolocation) {
        setLocationError(true);
        return;
      }

      setGettingLocation(true);
      navigator.geolocation.getCurrentPosition(
        async (position) => {
          const { latitude, longitude } = position.coords;
          
          // Reverse geocoding
          try {
            const response = await fetch(
              `https://nominatim.openstreetmap.org/reverse?lat=${latitude}&lon=${longitude}&format=json&addressdetails=1`,
              {
                headers: { 'User-Agent': 'ParaServir-App/1.0' }
              }
            );
            
            if (response.ok) {
              const data = await response.json();
              if (data && data.address) {
                const city = data.address.city || data.address.town || data.address.village || "";
                const state = data.address.state || "";
                const address = [city, state].filter(Boolean).join(", ");
                if (address) {
                  setSearchLocation(address);
                  setLocationError(false);
                } else {
                  setLocationError(true);
                }
              } else {
                setLocationError(true);
              }
            } else {
              setLocationError(true);
            }
          } catch (err) {
            // Silenciar errores esperados de geocoding
            setLocationError(true);
          }
          
          setGettingLocation(false);
        },
        (err) => {
          // Silenciar errores esperados de geolocalización (permisos denegados, timeout, etc.)
          // Solo loguear errores críticos en desarrollo
          if (process.env.NODE_ENV === 'development' && err.code !== 1 && err.code !== 3) {
            console.warn("Geolocation error:", err.message);
          }
          setLocationError(true);
          setGettingLocation(false);
        },
        {
          timeout: 10000,
          enableHighAccuracy: true,
          maximumAge: 0
        }
      );
    };

    void getCurrentLocationAuto();
  }, []);

  // Obtener ubicación manualmente (si falla la automática)
  const handleGetCurrentLocation = async () => {
    if (!navigator.geolocation) {
      return;
    }

    setGettingLocation(true);
    setLocationError(false);
    try {
      navigator.geolocation.getCurrentPosition(
        async (position) => {
          const { latitude, longitude } = position.coords;
          
          // Reverse geocoding
          try {
            const response = await fetch(
              `https://nominatim.openstreetmap.org/reverse?lat=${latitude}&lon=${longitude}&format=json&addressdetails=1`,
              {
                headers: { 'User-Agent': 'ParaServir-App/1.0' }
              }
            );
            
            if (response.ok) {
              const data = await response.json();
              if (data && data.address) {
                const city = data.address.city || data.address.town || data.address.village || "";
                const state = data.address.state || "";
                const address = [city, state].filter(Boolean).join(", ");
                if (address) {
                  setSearchLocation(address);
                  setLocationError(false);
                }
              }
            }
          } catch (err) {
            // Silenciar errores esperados de geocoding
            setLocationError(true);
          }
          
          setGettingLocation(false);
        },
        (err) => {
          // Silenciar errores esperados de geolocalización
          // Solo loguear errores críticos en desarrollo
          if (process.env.NODE_ENV === 'development' && err.code !== 1 && err.code !== 3) {
            console.warn("Geolocation error:", err.message);
          }
          setLocationError(true);
          setGettingLocation(false);
        },
        {
          timeout: 10000,
          enableHighAccuracy: true,
          maximumAge: 0
        }
      );
    } catch (err) {
      setGettingLocation(false);
      setLocationError(true);
    }
  };

  const handleSearch = (e: FormEvent) => {
    e.preventDefault();
    const params = new URLSearchParams();
    
    // Si hay categoría seleccionada (y no es "all"), buscar por categoría
    if (searchCategory && searchCategory !== "all") {
      params.set("category", searchCategory);
    }
    
    // Si hay ubicación, agregar filtro de ubicación
    if (searchLocation && searchLocation.trim()) {
      params.set("location", searchLocation.trim());
    }
    
    // Navegar a la búsqueda con los parámetros
    navigate(`/workers?${params.toString()}`);
  };

  const handlePopularSearch = (categoryName: string) => {
    const category = categories.find(cat => 
      cat.name.toLowerCase().includes(categoryName.toLowerCase())
    );
    if (category) {
      // Buscar trabajadores por categoría usando el endpoint público
      navigate(`/workers?category=${category.id}`);
    } else {
      navigate(`/workers?search=${encodeURIComponent(categoryName)}`);
    }
  };

  const handleCategoryClick = (categoryId: string) => {
    // Buscar trabajadores por categoría usando el endpoint público
    navigate(`/workers?category=${categoryId}`);
  };

  const handleHowItWorks = (e: React.MouseEvent) => {
    e.preventDefault();
    // Scroll a la sección de seguridad o mostrar información
    const element = document.getElementById('security-section');
    if (element) {
      element.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  };

  const handleServicesClick = () => {
    // Redirigir a búsqueda de trabajadores sin filtros (muestra todos)
    navigate('/workers');
  };

  return (
    <div className="min-h-screen bg-[#F9FAFE]">
      {/* Header/Navigation */}
      <header className="bg-white border-b border-border sticky top-0 z-50 shadow-sm">
        <nav className="container mx-auto px-6 lg:px-8 py-4 flex items-center justify-between max-w-7xl">
          {/* Logo */}
          <Link to={ROUTES.PUBLIC.HOME} className="flex items-center gap-2 shrink-0">
            <div className="p-2 bg-[#58A3B0] rounded-lg">
              <Wrench className="h-5 w-5 text-white" />
            </div>
            <span className="text-xl font-bold text-foreground">ParaServir</span>
          </Link>

          {/* Navigation Links */}
          <div className="hidden md:flex items-center gap-6 lg:gap-8 flex-1 justify-center">
            <button
              onClick={handleHowItWorks}
              className="text-sm font-medium text-foreground hover:text-[#58A3B0] transition-colors cursor-pointer"
            >
              Cómo funciona
            </button>
            <button
              onClick={handleServicesClick}
              className="text-sm font-medium text-muted-foreground hover:text-[#58A3B0] transition-colors cursor-pointer"
            >
              Servicios
            </button>
            <Link 
              to={ROUTES.PUBLIC.REGISTER} 
              className="text-sm font-medium text-muted-foreground hover:text-[#58A3B0] transition-colors"
            >
              Soy Profesional
            </Link>
          </div>

          {/* Auth Buttons */}
          <div className="flex items-center gap-3 shrink-0">
            <Button
              variant="ghost"
              className="text-sm font-medium text-muted-foreground hover:text-foreground"
              onClick={() => navigate(ROUTES.PUBLIC.LOGIN)}
            >
              Inicia sesión
            </Button>
            <Button
              className="bg-[#58A3B0] hover:bg-[#58A3B0]/90 text-white font-medium px-4 lg:px-6 text-sm"
              onClick={() => navigate(ROUTES.PUBLIC.REGISTER)}
            >
              Regístrate
            </Button>
          </div>
        </nav>
      </header>

      {/* Hero Section - MEJORADO CON MÁS ESPACIO Y COLORES */}
      <section className="relative bg-gradient-to-br from-[#F9FAFE] via-white to-[#E8F4F8] pt-6 lg:pt-8 pb-12 lg:pb-16 overflow-hidden">
        {/* Elementos decorativos de fondo */}
        <div className="absolute top-0 right-0 w-96 h-96 bg-gradient-to-br from-[#58A3B0]/10 to-transparent rounded-full blur-3xl" />
        <div className="absolute bottom-0 left-0 w-96 h-96 bg-gradient-to-tr from-[#5877B0]/10 to-transparent rounded-full blur-3xl" />
        
        <div className="container mx-auto px-6 lg:px-12 xl:px-16 max-w-[1600px] relative z-10">
          <div className="grid lg:grid-cols-12 gap-8 lg:gap-12 items-center">
            {/* Columna Izquierda - Texto y Estadísticas */}
            <div className="lg:col-span-5 space-y-4">
              {/* Main Heading con gradiente - SUBIDO */}
              <h1 className="text-4xl md:text-5xl lg:text-6xl font-extrabold leading-tight mt-2">
                <span className="block text-gray-900 mb-1">Encuentra</span>
                <span className="block bg-gradient-to-r from-[#58A3B0] via-[#2FB8A8] to-[#5877B0] bg-clip-text text-transparent mb-1">
                  profesionales
                </span>
                <span className="block text-gray-800">confiables cerca de ti</span>
              </h1>

              {/* Description más grande */}
              <p className="text-lg md:text-xl text-gray-600 leading-relaxed font-medium">
                Desde reparaciones urgentes hasta proyectos de renovación, conecta con{" "}
                <span className="text-[#58A3B0] font-bold">expertos locales verificados</span> en minutos.
              </p>

              {/* Estadísticas destacadas - MÁS PEQUEÑAS */}
              <div className="grid grid-cols-3 gap-3 pt-4">
                <div className="bg-white/80 backdrop-blur-sm rounded-xl p-3 border-2 border-[#58A3B0]/20 shadow-md hover:shadow-lg transition-all duration-300 hover:scale-105">
                  <div className="text-xl font-bold bg-gradient-to-r from-[#58A3B0] to-[#5877B0] bg-clip-text text-transparent">5K+</div>
                  <div className="text-[10px] text-gray-600 font-medium mt-0.5">Profesionales</div>
                </div>
                <div className="bg-white/80 backdrop-blur-sm rounded-xl p-3 border-2 border-[#58A3B0]/20 shadow-md hover:shadow-lg transition-all duration-300 hover:scale-105">
                  <div className="text-xl font-bold bg-gradient-to-r from-[#58A3B0] to-[#5877B0] bg-clip-text text-transparent">100%</div>
                  <div className="text-[10px] text-gray-600 font-medium mt-0.5">Verificados</div>
                </div>
                <div className="bg-white/80 backdrop-blur-sm rounded-xl p-3 border-2 border-[#58A3B0]/20 shadow-md hover:shadow-lg transition-all duration-300 hover:scale-105">
                  <div className="text-xl font-bold bg-gradient-to-r from-[#58A3B0] to-[#5877B0] bg-clip-text text-transparent">24/7</div>
                  <div className="text-[10px] text-gray-600 font-medium mt-0.5">Soporte</div>
                </div>
              </div>
            </div>

            {/* Columna Derecha - Buscador */}
            <div className="lg:col-span-7">

              {/* Search Bar - DISEÑO MEJORADO CON MÁS ESPACIO */}
              <form onSubmit={handleSearch} className="w-full">
                <div className="bg-white/95 backdrop-blur-md rounded-3xl shadow-2xl border-2 border-[#58A3B0]/30 p-8 lg:p-10 hover:shadow-3xl transition-all duration-300 mb-0">
                  {/* Layout en columnas con más espacio */}
                  <div className="flex flex-col lg:flex-row gap-6 lg:gap-8 items-end">
                    {/* Campo 1: SELECT de Categorías */}
                    <div className="relative flex-1 w-full lg:w-auto">
                      <div className="flex items-center gap-2 mb-4">
                        <Search className="h-5 w-5 text-[#58A3B0]" />
                        <label className="text-base font-semibold text-foreground">¿Qué servicio necesitas?</label>
                      </div>
                      <Select value={searchCategory} onValueChange={setSearchCategory}>
                        <SelectTrigger className="h-14 text-base border-2 border-border rounded-xl hover:border-[#58A3B0] focus:border-[#58A3B0]">
                          <SelectValue placeholder="Todas las categorías" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="all">Todas las categorías</SelectItem>
                          {loadingCategories ? (
                            <SelectItem value="loading" disabled>Cargando categorías...</SelectItem>
                          ) : (
                            categories.map((cat) => (
                              <SelectItem key={cat.id} value={cat.id}>
                                {cat.name}
                              </SelectItem>
                            ))
                          )}
                        </SelectContent>
                      </Select>
                    </div>

                    {/* Separador visual */}
                    <div className="hidden lg:block w-px bg-border h-14" />

                    {/* Campo 2: Ubicación (automática o manual) */}
                    <div className="relative flex-1 w-full lg:w-auto">
                      <div className="flex items-center gap-2 mb-4">
                        <MapPin className="h-5 w-5 text-[#58A3B0]" />
                        <label className="text-base font-semibold text-foreground">Ubicación</label>
                        {gettingLocation && (
                          <div className="h-4 w-4 border-2 border-[#58A3B0] border-t-transparent rounded-full animate-spin" />
                        )}
                      </div>
                      <div className="relative">
                        <Input
                          type="text"
                          placeholder={gettingLocation ? "Detectando ubicación..." : "Código postal o ciudad"}
                          value={searchLocation}
                          onChange={(e) => setSearchLocation(e.target.value)}
                          className="pl-12 pr-12 h-14 text-base border-2 border-border rounded-xl focus:border-[#58A3B0] focus:ring-2 focus:ring-[#58A3B0]/20"
                          disabled={gettingLocation}
                        />
                        <MapPin className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
                        {/* Mostrar botón solo si falló la detección automática */}
                        {locationError && !gettingLocation && (
                          <Button
                            type="button"
                            variant="ghost"
                            size="icon"
                            className="absolute right-2 top-1/2 -translate-y-1/2 h-10 w-10 rounded-lg hover:bg-[#58A3B0]/10"
                            onClick={handleGetCurrentLocation}
                            title="Detectar mi ubicación"
                          >
                            <MapPin className="h-4 w-4 text-[#58A3B0]" />
                          </Button>
                        )}
                      </div>
                    </div>

                    {/* Botón Buscar mejorado */}
                    <div className="w-full lg:w-auto">
                      <Button
                        type="submit"
                        className="h-14 w-full lg:w-auto px-10 bg-gradient-to-r from-[#58A3B0] to-[#5877B0] hover:from-[#5877B0] hover:to-[#58A3B0] text-white font-bold rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 text-lg hover:scale-105"
                      >
                        <Search className="h-6 w-6 mr-2" />
                        Buscar Ahora
                      </Button>
                    </div>
                  </div>
                </div>
              </form>

              {/* Búsquedas Populares mejoradas - ALINEADAS CON EL BUSCADOR */}
              <div className="mt-10 lg:mt-12 flex flex-wrap items-center gap-4 px-8 lg:px-10">
                <span className="text-base font-semibold text-gray-600">Búsquedas populares:</span>
                {POPULAR_SEARCHES.map((search, index) => (
                  <button
                    key={index}
                    onClick={() => handlePopularSearch(search.name)}
                    className="px-5 py-2.5 bg-white/90 backdrop-blur-sm border-2 border-[#58A3B0]/30 rounded-full hover:border-[#58A3B0] hover:bg-[#58A3B0] hover:text-white transition-all duration-300 text-foreground font-medium hover:scale-110 shadow-md hover:shadow-lg"
                  >
                    {search.name}
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Categorías Principales - MEJORADO */}
      <section className="bg-white py-16 lg:py-20 relative overflow-hidden">
        {/* Decoración de fondo */}
        <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-gradient-to-bl from-[#58A3B0]/5 to-transparent rounded-full blur-3xl" />
        
        <div className="container mx-auto px-6 lg:px-12 xl:px-16 max-w-[1600px] relative z-10">
          <div className="flex items-center justify-between mb-12">
            <div className="space-y-3">
              <Badge className="bg-gradient-to-r from-[#58A3B0] to-[#5877B0] text-white border-0 px-4 py-1.5 text-sm font-bold">
                SERVICIOS POPULARES
              </Badge>
              <h2 className="text-4xl md:text-5xl lg:text-6xl font-extrabold text-gray-900">
                Categorías{" "}
                <span className="bg-gradient-to-r from-[#58A3B0] via-[#2FB8A8] to-[#5877B0] bg-clip-text text-transparent">
                  principales
                </span>
              </h2>
              <p className="text-lg md:text-xl text-gray-600 font-medium">
                Explora los servicios más solicitados esta semana
              </p>
            </div>
            <button
              onClick={handleServicesClick}
              className="hidden lg:flex items-center gap-2 bg-gradient-to-r from-[#58A3B0] to-[#5877B0] hover:from-[#5877B0] hover:to-[#58A3B0] text-white font-bold px-6 py-3 rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-105"
            >
              Ver todas <ArrowRight className="h-5 w-5" />
            </button>
          </div>

          {loadingCategories ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 lg:gap-8">
              {[1, 2, 3, 4, 5, 6, 7, 8].map((i) => (
                <div key={i} className="h-72 bg-gradient-to-br from-gray-100 to-gray-200 animate-pulse rounded-2xl border-2 border-gray-200" />
              ))}
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 lg:gap-8">
              {categories?.slice(0, 8).map((category) => (
                <div
                  key={category.id}
                  onClick={() => handleCategoryClick(category.id)}
                  className="group cursor-pointer"
                >
                  <CategoryCard
                    category={category}
                    onClick={handleCategoryClick}
                  />
                </div>
              ))}
            </div>
          )}
          
          {/* Botón Ver todas para mobile */}
          <div className="lg:hidden flex justify-center mt-8">
            <button
              onClick={handleServicesClick}
              className="flex items-center gap-2 bg-gradient-to-r from-[#58A3B0] to-[#5877B0] hover:from-[#5877B0] hover:to-[#58A3B0] text-white font-bold px-8 py-4 rounded-xl shadow-lg hover:shadow-xl transition-all duration-300"
            >
              Ver todas las categorías <ArrowRight className="h-5 w-5" />
            </button>
          </div>
        </div>
      </section>

      {/* Tu Tranquilidad Primero - Seguridad y Calidad - MEJORADO */}
      <section id="security-section" className="bg-gradient-to-br from-[#F9FAFE] via-white to-[#E8F4F8] py-20 lg:py-28 relative overflow-hidden">
        {/* Decoraciones de fondo */}
        <div className="absolute top-20 left-0 w-72 h-72 bg-[#58A3B0]/5 rounded-full blur-3xl" />
        <div className="absolute bottom-20 right-0 w-96 h-96 bg-[#5877B0]/5 rounded-full blur-3xl" />
        
        <div className="container mx-auto px-6 lg:px-12 xl:px-16 max-w-[1600px] relative z-10">
          <div className="max-w-3xl mx-auto text-center mb-16">
            <Badge className="mb-6 bg-gradient-to-r from-[#58A3B0] to-[#5877B0] text-white border-0 px-6 py-2 text-base font-bold shadow-lg">
              ✨ Tu tranquilidad primero
            </Badge>
            <h2 className="text-4xl md:text-5xl lg:text-6xl font-extrabold mb-6 leading-tight">
              <span className="text-gray-900">Seguridad y</span>{" "}
              <span className="bg-gradient-to-r from-[#58A3B0] via-[#2FB8A8] to-[#5877B0] bg-clip-text text-transparent">
                calidad
              </span>
              <br />
              <span className="text-gray-900">en cada servicio</span>
            </h2>
            <p className="text-lg md:text-xl text-gray-600 font-medium max-w-2xl mx-auto leading-relaxed">
              Diseñamos nuestra plataforma pensando en tu seguridad y satisfacción. Cada profesional pasa por un{" "}
              <span className="text-[#58A3B0] font-bold">riguroso proceso de verificación</span>.
            </p>
          </div>

          <div className="grid md:grid-cols-2 gap-10 lg:gap-16 items-center">
            {/* Features - Izquierda - MEJORADO */}
            <div className="space-y-6">
              <div className="group flex items-start gap-5 p-6 bg-white/80 backdrop-blur-sm rounded-2xl border-2 border-[#58A3B0]/20 hover:border-[#58A3B0] hover:shadow-xl transition-all duration-300 hover:scale-105">
                <div className="p-4 bg-gradient-to-br from-[#58A3B0] to-[#5877B0] rounded-xl shrink-0 shadow-lg group-hover:scale-110 transition-transform">
                  <CheckCircle2 className="h-7 w-7 text-white" />
                </div>
                <div>
                  <h3 className="font-bold text-xl mb-3 text-gray-900">Profesionales Verificados</h3>
                  <p className="text-base text-gray-600 leading-relaxed">
                    Revisamos manualmente la identidad, antecedentes y certificaciones de cada profesional antes de que se una a nuestra plataforma.
                  </p>
                </div>
              </div>

              <div className="group flex items-start gap-5 p-6 bg-white/80 backdrop-blur-sm rounded-2xl border-2 border-[#58A3B0]/20 hover:border-[#58A3B0] hover:shadow-xl transition-all duration-300 hover:scale-105">
                <div className="p-4 bg-gradient-to-br from-[#2FB8A8] to-[#58A3B0] rounded-xl shrink-0 shadow-lg group-hover:scale-110 transition-transform">
                  <Lock className="h-7 w-7 text-white" />
                </div>
                <div>
                  <h3 className="font-bold text-xl mb-3 text-gray-900">Pagos Seguros</h3>
                  <p className="text-base text-gray-600 leading-relaxed">
                    Tu pago se mantiene seguro hasta que el trabajo se complete según lo acordado. Solo pagas cuando estés satisfecho.
                  </p>
                </div>
              </div>

              <div className="group flex items-start gap-5 p-6 bg-white/80 backdrop-blur-sm rounded-2xl border-2 border-[#58A3B0]/20 hover:border-[#58A3B0] hover:shadow-xl transition-all duration-300 hover:scale-105">
                <div className="p-4 bg-gradient-to-br from-[#5877B0] to-[#58A3B0] rounded-xl shrink-0 shadow-lg group-hover:scale-110 transition-transform">
                  <HeadphonesIcon className="h-7 w-7 text-white" />
                </div>
                <div>
                  <h3 className="font-bold text-xl mb-3 text-gray-900">Soporte 24/7</h3>
                  <p className="text-base text-gray-600 leading-relaxed">
                    Nuestro equipo de atención al cliente está disponible en todo momento para ayudarte con cualquier pregunta o problema.
                  </p>
                </div>
              </div>
            </div>

            {/* Profesional Destacado - Derecha - MEJORADO */}
            {featuredWorker && (
              <div className="relative group">
                <div className="relative h-[500px] rounded-3xl overflow-hidden bg-gradient-to-br from-[#58A3B0]/30 via-[#2FB8A8]/20 to-[#5877B0]/30 shadow-2xl hover:shadow-3xl transition-all duration-500 group-hover:scale-[1.02] border-2 border-[#58A3B0]/30">
                  {/* Placeholder para imagen del profesional */}
                  <div className="absolute inset-0 flex items-center justify-center">
                    <Avatar className="h-32 w-32 border-4 border-white shadow-xl">
                      <AvatarImage 
                        src={getWorkerAvatar(featuredWorker.id, featuredWorker.avatar_url, featuredWorker.first_name, featuredWorker.last_name)} 
                        alt={`${featuredWorker.first_name} ${featuredWorker.last_name}`} 
                      />
                      <AvatarFallback className="bg-[#58A3B0] text-white text-2xl font-bold">
                        {`${(featuredWorker.first_name || "")[0] || ""}${(featuredWorker.last_name || "")[0] || ""}`.toUpperCase() || "P"}
                      </AvatarFallback>
                    </Avatar>
                  </div>

                  {/* Card overlay abajo - MEJORADO */}
                  <div className="absolute bottom-0 left-0 right-0 bg-white/98 backdrop-blur-md p-8 rounded-t-3xl border-t-2 border-[#58A3B0]/30 shadow-2xl">
                    <div className="flex items-center justify-between mb-4">
                      <div>
                        <h3 className="font-extrabold text-2xl text-gray-900 mb-1">{featuredWorker.first_name} {featuredWorker.last_name}</h3>
                        <Badge className="bg-gradient-to-r from-[#58A3B0] to-[#5877B0] text-white border-0 px-3 py-1 text-xs font-bold">
                          ✓ Profesional Certificado
                        </Badge>
                      </div>
                      {featuredRating > 0 && (
                        <div className="flex items-center gap-2 bg-gradient-to-r from-[#F4B840] to-[#FFD700] px-4 py-2 rounded-full shadow-lg">
                          <Star className="h-5 w-5 fill-white text-white" />
                          <span className="font-extrabold text-base text-white">{featuredRating.toFixed(1)}</span>
                        </div>
                      )}
                    </div>
                    <Button
                      className="w-full bg-gradient-to-r from-[#58A3B0] to-[#5877B0] hover:from-[#5877B0] hover:to-[#58A3B0] text-white font-bold py-6 text-lg shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-105"
                      onClick={() => navigate(`/worker/${featuredWorker.id}`)}
                    >
                      Ver Perfil Completo
                    </Button>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </section>

      {/* Sección para Profesionales - MEJORADO */}
      <section className="container mx-auto px-6 lg:px-12 xl:px-16 py-20 lg:py-28 max-w-[1600px]">
        <div className="bg-gradient-to-br from-[#58A3B0] via-[#2FB8A8] to-[#5877B0] rounded-3xl p-10 lg:p-16 text-white relative overflow-hidden shadow-2xl hover:shadow-3xl transition-all duration-500">
          {/* Decoración de fondo animada */}
          <div className="absolute top-0 right-0 opacity-20 animate-pulse">
            <Calendar className="h-80 w-80 text-white" />
          </div>
          <div className="absolute bottom-0 left-0 opacity-20 animate-pulse delay-300">
            <MessageSquare className="h-64 w-64 text-white" />
          </div>
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 opacity-10">
            <Wrench className="h-96 w-96 text-white" />
          </div>

          <div className="relative max-w-3xl grid lg:grid-cols-2 gap-8 lg:gap-12 items-center">
            <div>
              <Badge className="mb-6 bg-white/20 backdrop-blur-sm text-white border-0 px-4 py-2 text-sm font-bold">
                PARA PROFESIONALES
              </Badge>
              <h2 className="text-4xl md:text-5xl lg:text-6xl font-extrabold mb-6 leading-tight">
                ¿Eres un{" "}
                <span className="block bg-white/20 backdrop-blur-sm px-4 py-2 rounded-2xl inline-block">
                  profesional?
                </span>
              </h2>
              <p className="text-xl lg:text-2xl mb-8 text-white/95 leading-relaxed font-medium">
                Únete a ParaServir y conecta con clientes que necesitan tus servicios. Gestiona tu agenda, recibe pagos seguros y{" "}
                <span className="font-bold">haz crecer tu negocio</span>.
              </p>
              <Button
                size="lg"
                className="bg-white text-[#58A3B0] hover:bg-white/90 font-extrabold px-10 py-6 text-lg rounded-xl shadow-xl hover:shadow-2xl transition-all duration-300 hover:scale-105"
                onClick={() => navigate(ROUTES.PUBLIC.REGISTER)}
              >
                Ofrecer mis servicios →
              </Button>
            </div>
            
            {/* Estadísticas para profesionales */}
            <div className="grid grid-cols-2 gap-4">
              <div className="bg-white/20 backdrop-blur-md rounded-2xl p-6 border-2 border-white/30">
                <div className="text-4xl font-extrabold mb-2">+50%</div>
                <div className="text-sm text-white/90 font-medium">Más clientes</div>
              </div>
              <div className="bg-white/20 backdrop-blur-md rounded-2xl p-6 border-2 border-white/30">
                <div className="text-4xl font-extrabold mb-2">100%</div>
                <div className="text-sm text-white/90 font-medium">Pagos seguros</div>
              </div>
              <div className="bg-white/20 backdrop-blur-md rounded-2xl p-6 border-2 border-white/30">
                <div className="text-4xl font-extrabold mb-2">24/7</div>
                <div className="text-sm text-white/90 font-medium">Gestión fácil</div>
              </div>
              <div className="bg-white/20 backdrop-blur-md rounded-2xl p-6 border-2 border-white/30">
                <div className="text-4xl font-extrabold mb-2">0%</div>
                <div className="text-sm text-white/90 font-medium">Comisión inicial</div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-white border-t border-border mt-20">
        <div className="container mx-auto px-6 lg:px-8 py-12 max-w-7xl">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8 mb-8">
            {/* About */}
            <div className="space-y-4">
              <div className="flex items-center gap-2 mb-4">
                <div className="p-2 bg-[#58A3B0] rounded-lg">
                  <Wrench className="h-5 w-5 text-white" />
                </div>
                <span className="text-lg font-bold text-foreground">ParaServir</span>
              </div>
              <p className="text-sm text-muted-foreground">
                La plataforma líder para conectar con profesionales locales de confianza. Rápido, seguro y garantizado.
              </p>
              <div className="flex items-center gap-4">
                <a href="#" className="text-muted-foreground hover:text-[#58A3B0] transition-colors">
                  <Facebook className="h-5 w-5" />
                </a>
                <a href="#" className="text-muted-foreground hover:text-[#58A3B0] transition-colors">
                  <Instagram className="h-5 w-5" />
                </a>
              </div>
            </div>

            {/* Compañía */}
            <div>
              <h4 className="font-semibold text-foreground mb-4">Compañía</h4>
              <ul className="space-y-2 text-sm">
                <li>
                  <Link to={ROUTES.NAVIGATION.ABOUT} className="text-muted-foreground hover:text-[#58A3B0] transition-colors">
                    Acerca de nosotros
                  </Link>
                </li>
                <li>
                  <a href="#" className="text-muted-foreground hover:text-[#58A3B0] transition-colors">
                    Carreras
                  </a>
                </li>
                <li>
                  <a href="#" className="text-muted-foreground hover:text-[#58A3B0] transition-colors">
                    Prensa
                  </a>
                </li>
                <li>
                  <a href="#" className="text-muted-foreground hover:text-[#58A3B0] transition-colors">
                    Blog
                  </a>
                </li>
              </ul>
            </div>

            {/* Servicios */}
            <div>
              <h4 className="font-semibold text-foreground mb-4">Servicios</h4>
              <ul className="space-y-2 text-sm">
                <li>
                  <button onClick={() => handlePopularSearch("Plomería")} className="text-muted-foreground hover:text-[#58A3B0] transition-colors">
                    Plomería
                  </button>
                </li>
                <li>
                  <button onClick={() => handlePopularSearch("Electricidad")} className="text-muted-foreground hover:text-[#58A3B0] transition-colors">
                    Electricidad
                  </button>
                </li>
                <li>
                  <button onClick={() => handlePopularSearch("Limpieza")} className="text-muted-foreground hover:text-[#58A3B0] transition-colors">
                    Limpieza
                  </button>
                </li>
                <li>
                  <button onClick={handleServicesClick} className="text-muted-foreground hover:text-[#58A3B0] transition-colors cursor-pointer">
                    Ver todas
                  </button>
                </li>
              </ul>
            </div>

            {/* Soporte */}
            <div>
              <h4 className="font-semibold text-foreground mb-4">Soporte</h4>
              <ul className="space-y-2 text-sm">
                <li>
                  <Link to="/dashboard/help" className="text-muted-foreground hover:text-[#58A3B0] transition-colors">
                    Centro de ayuda
                  </Link>
                </li>
                <li>
                  <a href="#" className="text-muted-foreground hover:text-[#58A3B0] transition-colors">
                    Confianza y seguridad
                  </a>
                </li>
                <li>
                  <a href="#" className="text-muted-foreground hover:text-[#58A3B0] transition-colors">
                    Términos de servicio
                  </a>
                </li>
                <li>
                  <a href="#" className="text-muted-foreground hover:text-[#58A3B0] transition-colors">
                    Política de privacidad
                  </a>
                </li>
              </ul>
            </div>
          </div>

          {/* Copyright */}
          <div className="border-t border-border pt-8 flex flex-col md:flex-row items-center justify-between gap-4">
            <p className="text-sm text-muted-foreground">
              © 2025 ParaServir. All rights reserved.
            </p>
            <div className="flex items-center gap-4 text-sm">
              <a href="#" className="text-muted-foreground hover:text-[#58A3B0] transition-colors">
                Privacidad
              </a>
              <span className="text-muted-foreground">·</span>
              <a href="#" className="text-muted-foreground hover:text-[#58A3B0] transition-colors">
                Términos
              </a>
              <span className="text-muted-foreground">·</span>
              <a href="#" className="text-muted-foreground hover:text-[#58A3B0] transition-colors">
                Mapa del sitio
              </a>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
