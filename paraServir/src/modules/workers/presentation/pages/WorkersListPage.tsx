import { useEffect, useState, useMemo, useCallback } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { PageContainer } from "@/shared/components/layout/PageContainer";
import { PageHeader } from "@/shared/components/layout/PageHeader";
import { Card, CardContent } from "@/shared/components/ui/card";
import { Badge } from "@/shared/components/ui/badge";
import { Button } from "@/shared/components/ui/button";
import { Avatar, AvatarImage, AvatarFallback } from "@/shared/components/ui/avatar";
import { LoadingState } from "@/shared/components/feedback/LoadingState";
import { Alert, AlertDescription } from "@/shared/components/ui/alert";
import { AdvancedSearchWorkersUseCase } from "../../application/use-cases/advanced-search-workers.use-case";
import { ReviewController } from "@/modules/Reviews/infra/http/controllers/review.controller";
import type { WorkerProfileDto } from "../../application/dto/worker-profile.dto";
import { useAuth } from "@/shared/hooks/useAuth";
import { useSelector } from "react-redux";
import type { RootState } from "@/Store";
import { 
  MapPin, 
  CheckCircle2,
  AlertCircle,
  CheckSquare,
  Square,
  X,
  Filter,
  Search
} from "lucide-react";
import { ReviewRating } from "@/modules/Reviews/presentation/components/ReviewRating";
import { getWorkerAvatar } from "@/shared/utils/avatar-utils";
import { formatDistance } from "@/shared/utils/distance-utils";
import { AdvancedSearchFilters, type AdvancedSearchFiltersState } from "../components/AdvancedSearchFilters";
import { SimpleSearchBar } from "../components/SimpleSearchBar";
import { WorkerComparisonModal } from "../components/WorkerComparisonModal";
import { useFavorites } from "@/shared/hooks/useFavorites";
import { useSearchHistory } from "@/shared/hooks/useSearchHistory";
import { Heart } from "lucide-react";
import { toast } from "sonner";
import { isClient } from "@/shared/constants/user-roles.constants";
import { useCategories } from "@/shared/hooks/useCategories";
import { cn } from "@/shared/lib/utils";

export function WorkersListPage() {
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();
  const { getToken } = useAuth();
  const { categories } = useCategories();

  const [workers, setWorkers] = useState<WorkerProfileDto[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [ratings, setRatings] = useState<Record<string, number>>({});
  const { toggleFavorite, isFavorite } = useFavorites();
  const { saveSearch } = useSearchHistory();
  const user = useSelector((state: RootState) => state.auth.user);
  const role = user?.role;
  const [selectedForComparison, setSelectedForComparison] = useState<Set<string>>(new Set());
  const [showComparison, setShowComparison] = useState(false);
  const [filters, setFilters] = useState<AdvancedSearchFiltersState>({
    searchTerm: searchParams.get("search") || "",
    // Aceptar tanto 'category' como 'category_id' de la URL
    categoryId: searchParams.get("category") || searchParams.get("category_id") || "all",
    location: searchParams.get("location") || "",
    latitude: searchParams.get("lat") || searchParams.get("latitude") ? parseFloat(searchParams.get("lat") || searchParams.get("latitude") || "0") : null,
    longitude: searchParams.get("lng") || searchParams.get("longitude") ? parseFloat(searchParams.get("lng") || searchParams.get("longitude") || "0") : null,
    radius: searchParams.get("radius") ? parseInt(searchParams.get("radius")!) : 50,
    minPrice: searchParams.get("minPrice") ? parseFloat(searchParams.get("minPrice")!) : null,
    maxPrice: searchParams.get("maxPrice") ? parseFloat(searchParams.get("maxPrice")!) : null,
    minRating: searchParams.get("minRating") ? parseFloat(searchParams.get("minRating")!) : null,
    minExperience: searchParams.get("minExperience") ? parseInt(searchParams.get("minExperience")!) : null,
    sortBy: searchParams.get("sortBy") || "newest",
  });

  const advancedSearchUseCase = useMemo(() => new AdvancedSearchWorkersUseCase(), []);
  const reviewController = useMemo(() => new ReviewController(), []);

  // Obtener nombre de categoría
  const getCategoryName = (categoryId: string) => {
    if (categoryId === "all") return null;
    const category = categories.find(cat => cat.id === categoryId);
    return category?.name || null;
  };

  // Cargar trabajadores cuando cambian los filtros
  const loadWorkers = useCallback(async (currentFilters: AdvancedSearchFiltersState) => {
    setLoading(true);
    setError(null);

    try {
      const token = getToken();
      const workersData = await advancedSearchUseCase.execute(currentFilters, token || undefined);
      
      // Mostrar trabajadores que tengan datos básicos (nombre), sin filtrar por verificación
      const validWorkers = workersData.filter(w => w.first_name && w.first_name.trim() !== '');
      setWorkers(validWorkers);
      
      // Debug: mostrar cuántos trabajadores se encontraron
      if (validWorkers.length === 0 && workersData.length > 0) {
        console.warn("Se encontraron trabajadores pero ninguno es válido");
      }

      // Cargar ratings de cada trabajador
      const ratingsMap: Record<string, number> = {};
      for (const worker of validWorkers) {
        try {
          const reviews = await reviewController.getWorkerReviews(worker.id);
          ratingsMap[worker.id] = reviews.average_rating;
        } catch {
          ratingsMap[worker.id] = 0;
        }
      }
      setRatings(ratingsMap);

      // Guardar búsqueda en historial si hay filtros activos
      if (validWorkers.length > 0) {
        try {
          await saveSearch(currentFilters.searchTerm || undefined, {
            categoryId: currentFilters.categoryId,
            location: currentFilters.location,
            latitude: currentFilters.latitude || undefined,
            longitude: currentFilters.longitude || undefined,
            radius: currentFilters.radius,
            minPrice: currentFilters.minPrice || undefined,
            maxPrice: currentFilters.maxPrice || undefined,
            minRating: currentFilters.minRating || undefined,
            minExperience: currentFilters.minExperience || undefined,
            sortBy: currentFilters.sortBy,
          });
        } catch (err) {
          // Silenciosamente falla - no es crítico
          console.error("Error saving search history:", err);
        }
      }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : "Error al cargar trabajadores";
      setError(errorMessage);
    } finally {
      setLoading(false);
    }
  }, [advancedSearchUseCase, reviewController, getToken, saveSearch]);

  // Cargar trabajadores al montar o cuando cambian los filtros
  useEffect(() => {
    void loadWorkers(filters);
  }, [filters, loadWorkers]);

  // Actualizar URL cuando cambian los filtros
  useEffect(() => {
    const params = new URLSearchParams();
    if (filters.searchTerm) params.set("search", filters.searchTerm);
    if (filters.categoryId && filters.categoryId !== "all") params.set("category", filters.categoryId);
    if (filters.location) params.set("location", filters.location);
    if (filters.latitude) params.set("lat", filters.latitude.toString());
    if (filters.longitude) params.set("lng", filters.longitude.toString());
    if (filters.radius !== 50) params.set("radius", filters.radius.toString());
    if (filters.minPrice) params.set("minPrice", filters.minPrice.toString());
    if (filters.maxPrice) params.set("maxPrice", filters.maxPrice.toString());
    if (filters.minRating) params.set("minRating", filters.minRating.toString());
    if (filters.minExperience) params.set("minExperience", filters.minExperience.toString());
    if (filters.sortBy !== "distance") params.set("sortBy", filters.sortBy);
    
    setSearchParams(params, { replace: true });
  }, [filters, setSearchParams]);

  const handleFiltersChange = useCallback((newFilters: AdvancedSearchFiltersState) => {
    setFilters(newFilters);
  }, []);

  const handleClearFilter = useCallback((filterKey: keyof AdvancedSearchFiltersState) => {
    setFilters(prev => {
      const newFilters = { ...prev };
      switch (filterKey) {
        case "categoryId":
          newFilters.categoryId = "all";
          break;
        case "location":
          newFilters.location = "";
          newFilters.latitude = null;
          newFilters.longitude = null;
          break;
        case "minPrice":
          newFilters.minPrice = null;
          break;
        case "maxPrice":
          newFilters.maxPrice = null;
          break;
        case "minRating":
          newFilters.minRating = null;
          break;
        case "minExperience":
          newFilters.minExperience = null;
          break;
        case "radius":
          newFilters.radius = 50;
          break;
        case "sortBy":
          newFilters.sortBy = "distance";
          break;
        case "searchTerm":
          newFilters.searchTerm = "";
          break;
      }
      return newFilters;
    });
  }, []);

  const handleToggleComparison = (workerId: string, e: React.MouseEvent) => {
    e.stopPropagation();
    setSelectedForComparison(prev => {
      const newSet = new Set(prev);
      if (newSet.has(workerId)) {
        newSet.delete(workerId);
      } else {
        if (newSet.size >= 3) {
          toast.error("Solo puedes comparar hasta 3 trabajadores");
          return prev;
        }
        newSet.add(workerId);
      }
      return newSet;
    });
  };

  // Calcular filtros activos
  const activeFilters = useMemo(() => {
    const active: Array<{ key: keyof AdvancedSearchFiltersState; label: string; value: string }> = [];
    
    if (filters.searchTerm) {
      active.push({ key: "searchTerm", label: "Búsqueda", value: filters.searchTerm });
    }
    if (filters.categoryId && filters.categoryId !== "all") {
      const categoryName = getCategoryName(filters.categoryId);
      if (categoryName) {
        active.push({ key: "categoryId", label: "Categoría", value: categoryName });
      }
    }
    if (filters.location) {
      active.push({ key: "location", label: "Ubicación", value: filters.location });
    }
    if (filters.minPrice || filters.maxPrice) {
      const priceRange = filters.minPrice && filters.maxPrice
        ? `$${filters.minPrice} - $${filters.maxPrice}`
        : filters.minPrice
        ? `Desde $${filters.minPrice}`
        : `Hasta $${filters.maxPrice}`;
      active.push({ key: "minPrice", label: "Precio", value: priceRange });
    }
    if (filters.minRating) {
      active.push({ key: "minRating", label: "Rating", value: `${filters.minRating}+ estrellas` });
    }
    if (filters.minExperience) {
      active.push({ key: "minExperience", label: "Experiencia", value: `${filters.minExperience}+ años` });
    }
    if (filters.radius !== 50) {
      active.push({ 
        key: "radius", 
        label: "Radio", 
        value: filters.radius === 1000 ? "Sin límite" : `${filters.radius} km` 
      });
    }
    
    return active;
  }, [filters, categories]);

  const handleSimpleSearch = (searchFilters: {
    categoryId?: string;
    location?: string;
    minRating?: number;
  }) => {
    const newFilters: AdvancedSearchFiltersState = {
      ...filters,
      searchTerm: "", // Limpiar búsqueda de texto cuando se usan filtros
      categoryId: searchFilters.categoryId || "all",
      location: searchFilters.location || "",
      minRating: searchFilters.minRating || null,
    };
    setFilters(newFilters);
  };

  // Título dinámico según categoría
  const pageTitle = useMemo(() => {
    const categoryName = getCategoryName(filters.categoryId);
    if (categoryName) {
      return `Trabajadores de ${categoryName}`;
    }
    return "Buscar Trabajadores";
  }, [filters.categoryId, categories]);

  return (
    <PageContainer>
      <div className="space-y-6">
        <PageHeader 
          title={pageTitle} 
          description={filters.categoryId !== "all" ? `Encuentra profesionales de ${getCategoryName(filters.categoryId)} cerca de ti` : "Encuentra profesionales para tus necesidades"}
        />

        {/* BUSCADOR MEJORADO - MEJOR DISEÑO Y UX */}
        <div className="bg-gradient-to-br from-white to-[#F9FAFE] border-2 border-[#58A3B0]/20 rounded-2xl shadow-lg p-6">
          <SimpleSearchBar
            onSearch={handleSimpleSearch}
            initialCategory={filters.categoryId}
            initialLocation={filters.location}
          />
        </div>

        {/* Mostrar error si existe */}
        {error && (
          <Alert variant="destructive">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}

        {/* Botón Comparar */}
        {selectedForComparison.size >= 2 && (
          <div className="flex items-center justify-between">
            <div className="text-sm text-muted-foreground">
              {selectedForComparison.size} {selectedForComparison.size === 1 ? "trabajador seleccionado" : "trabajadores seleccionados"} para comparar
            </div>
            <Button 
              onClick={() => setShowComparison(true)}
              className="gap-2"
            >
              <CheckSquare className="h-4 w-4" />
              Comparar ({selectedForComparison.size})
            </Button>
          </div>
        )}

        {/* Filtros Avanzados - OCULTO - Solo usar SimpleSearchBar */}

        {/* Filtros Activos */}
        {activeFilters.length > 0 && (
          <Card className="border-border rounded-xl shadow-sm bg-white">
            <CardContent className="p-4">
              <div className="flex items-center gap-2 flex-wrap">
                <Filter className="h-4 w-4 text-muted-foreground" />
                <span className="text-sm font-medium text-muted-foreground">Filtros activos:</span>
                {activeFilters.map((filter, index) => (
                  <Badge
                    key={`${filter.key}-${index}`}
                    variant="secondary"
                    className="gap-1.5 px-3 py-1 text-sm font-normal"
                  >
                    <span className="font-medium">{filter.label}:</span>
                    <span>{filter.value}</span>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-4 w-4 p-0 hover:bg-transparent"
                      onClick={() => handleClearFilter(filter.key)}
                      aria-label={`Quitar filtro ${filter.label}`}
                    >
                      <X className="h-3 w-3" />
                    </Button>
                  </Badge>
                ))}
              </div>
            </CardContent>
          </Card>
        )}

        {/* Loading State */}
        {loading && (
          <div className="py-8">
            <LoadingState message="Cargando trabajadores..." variant="grid" count={6} />
          </div>
        )}

        {/* Resultados */}
        {!loading && workers.length === 0 && !error && (
          <Card className="border-border rounded-xl shadow-sm">
            <CardContent className="py-12 text-center">
              <Search className="h-12 w-12 text-muted-foreground mx-auto mb-4 opacity-50" />
              <p className="text-muted-foreground font-medium text-lg mb-2">
                No se encontraron trabajadores con esos criterios
              </p>
              <p className="text-sm text-muted-foreground">
                Intenta ajustar los filtros de búsqueda o buscar con otros términos
              </p>
            </CardContent>
          </Card>
        )}

        {/* Mostrar resultados */}
        {!loading && workers.length > 0 && (
          <>
            <div className="flex items-center justify-between">
              <p className="text-sm text-muted-foreground">
                {workers.length} {workers.length === 1 ? "trabajador encontrado" : "trabajadores encontrados"}
              </p>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {workers.map((worker) => {
                const fullName = `${worker.first_name} ${worker.last_name || ""}`.trim();
                const initials = `${worker.first_name[0]}${(worker.last_name || "")[0] || ""}`.toUpperCase();
                const rating = ratings[worker.id] || 0;

                return (
                  <Card 
                    key={worker.id} 
                    className="cursor-pointer hover:shadow-lg transition-shadow relative border-border rounded-xl shadow-sm bg-white"
                    onClick={() => navigate(`/worker/${worker.id}`)}
                  >
                    <CardContent className="p-6">
                      {/* Botones de acción - esquina superior derecha */}
                      <div className="absolute top-4 right-4 flex items-center gap-2 z-10">
                        {/* Checkbox Comparar */}
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-8 w-8"
                          onClick={(e) => handleToggleComparison(worker.id, e)}
                          aria-label={selectedForComparison.has(worker.id) ? "Quitar de comparación" : "Agregar a comparación"}
                        >
                          {selectedForComparison.has(worker.id) ? (
                            <CheckSquare className="h-4 w-4 text-[#58A3B0] fill-current" />
                          ) : (
                            <Square className="h-4 w-4 text-muted-foreground" />
                          )}
                        </Button>
                        {/* Botón de favorito */}
                        {isClient(role) && (
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-8 w-8"
                            onClick={(e) => {
                              e.stopPropagation();
                              const workerIsFavorite = isFavorite(worker.id);
                              toggleFavorite(worker.id)
                                .then(() => {
                                  toast.success(
                                    workerIsFavorite 
                                      ? "Eliminado de favoritos" 
                                      : "Agregado a favoritos"
                                  );
                                })
                                .catch(() => {
                                  toast.error("Error al actualizar favoritos");
                                });
                            }}
                            aria-label={isFavorite(worker.id) ? "Eliminar de favoritos" : "Agregar a favoritos"}
                          >
                            <Heart 
                              className={cn(
                                "h-4 w-4",
                                isFavorite(worker.id) 
                                  ? "fill-red-500 text-red-500" 
                                  : "text-muted-foreground"
                              )}
                            />
                          </Button>
                        )}
                      </div>
                      
                      <div className="flex items-start gap-4 mb-4">
                        <Avatar className="h-16 w-16 border-2 border-border shrink-0">
                          <AvatarImage 
                            src={getWorkerAvatar(worker.id, worker.avatar_url, worker.first_name, worker.last_name)} 
                            alt={fullName} 
                          />
                          <AvatarFallback className="bg-[#58A3B0] text-white text-lg font-semibold">
                            {initials || "U"}
                          </AvatarFallback>
                        </Avatar>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2 mb-1">
                            <h3 className="font-semibold text-base truncate">{fullName}</h3>
                            {worker.verification_status === "verified" && (
                              <CheckCircle2 className="h-4 w-4 text-[#58A3B0] flex-shrink-0" />
                            )}
                          </div>
                          {rating > 0 && (
                            <div className="flex items-center gap-1 mb-2">
                              <ReviewRating rating={rating} size="sm" showValue />
                            </div>
                          )}
                          {(worker.location || worker.distance_km) && (
                            <div className="flex items-center gap-1.5 text-sm text-muted-foreground flex-wrap">
                              {worker.location && (
                                <div className="flex items-center gap-1">
                                  <MapPin className="h-3 w-3 flex-shrink-0" />
                                  <span className="truncate">{worker.location}</span>
                                </div>
                              )}
                              {worker.distance_km && formatDistance(worker.distance_km) && (
                                <>
                                  {worker.location && <span className="text-muted-foreground/50">•</span>}
                                  <span className="text-[#58A3B0] font-medium">
                                    {formatDistance(worker.distance_km)}
                                  </span>
                                </>
                              )}
                            </div>
                          )}
                        </div>
                      </div>

                      <div className="space-y-3 mb-4">
                        {/* Categoría destacada - más visible */}
                        {worker.category_name && (
                          <Badge variant="default" className="text-xs bg-[#58A3B0] text-white font-semibold px-3 py-1">
                            {worker.category_name}
                          </Badge>
                        )}
                        
                        {/* Otras badges */}
                        <div className="flex flex-wrap gap-2">
                          {worker.verification_status === "verified" && (
                            <Badge variant="secondary" className="text-xs bg-green-50 text-green-700 border-green-200">
                              <CheckCircle2 className="h-3 w-3 mr-1" />
                              Verificado
                            </Badge>
                          )}
                          {worker.is_active && (
                            <Badge variant="secondary" className="text-xs bg-blue-50 text-blue-700 border-blue-200">
                              Disponible
                            </Badge>
                          )}
                          {worker.years_experience && (
                            <Badge variant="outline" className="text-xs">
                              {worker.years_experience} {worker.years_experience === 1 ? "año" : "años"} exp.
                            </Badge>
                          )}
                        </div>
                      </div>

                      <Button 
                        className="w-full mt-4 bg-[#58A3B0] hover:bg-[#58A3B0]/90 text-white" 
                        onClick={(e) => {
                          e.stopPropagation();
                          navigate(`/worker/${worker.id}`);
                        }}
                      >
                        Ver Perfil
                      </Button>
                    </CardContent>
                  </Card>
                );
              })}
            </div>
          </>
        )}

        {/* Modal de Comparación */}
        <WorkerComparisonModal
          open={showComparison}
          onOpenChange={setShowComparison}
          workers={workers.filter(w => selectedForComparison.has(w.id))}
          ratings={ratings}
        />
      </div>
    </PageContainer>
  );
}
