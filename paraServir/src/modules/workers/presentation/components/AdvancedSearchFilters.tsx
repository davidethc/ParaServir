import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/shared/components/ui/card";
import { Input } from "@/shared/components/ui/input";
import { Label } from "@/shared/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/shared/components/ui/select";
import { Button } from "@/shared/components/ui/button";
import { Search, MapPin, DollarSign, Star, Briefcase, Navigation, X, History, Clock } from "lucide-react";
import { useGeolocation } from "@/shared/hooks/useGeolocation";
import { useCategories } from "@/shared/hooks/useCategories";
import { useSearchHistory } from "@/shared/hooks/useSearchHistory";
import { useAuth } from "@/shared/hooks/useAuth";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/shared/components/ui/dropdown-menu";
import { formatDistanceToNow } from "date-fns";
import { es } from "date-fns/locale";

export interface AdvancedSearchFiltersProps {
  onFiltersChange: (filters: AdvancedSearchFiltersState) => void;
  initialFilters?: Partial<AdvancedSearchFiltersState>;
}

export interface AdvancedSearchFiltersState {
  searchTerm: string;
  categoryId: string;
  location: string;
  latitude?: number | null;
  longitude?: number | null;
  radius: number;
  minPrice?: number | null;
  maxPrice?: number | null;
  minRating?: number | null;
  minExperience?: number | null;
  sortBy: string;
}

const RADIUS_OPTIONS = [
  { value: "5", label: "5 km" },
  { value: "10", label: "10 km" },
  { value: "25", label: "25 km" },
  { value: "50", label: "50 km" },
  { value: "100", label: "100 km" },
  { value: "0", label: "Sin límite" },
];

const SORT_OPTIONS = [
  { value: "distance", label: "Más cercanos" },
  { value: "price_asc", label: "Precio: menor a mayor" },
  { value: "price_desc", label: "Precio: mayor a menor" },
  { value: "rating_desc", label: "Mejor valorados" },
  { value: "experience_desc", label: "Más experiencia" },
  { value: "newest", label: "Más recientes" },
];

export function AdvancedSearchFilters({
  onFiltersChange,
  initialFilters,
}: AdvancedSearchFiltersProps) {
  const { categories } = useCategories();
  const { getCurrentLocation } = useGeolocation();
  const { searches, loading: historyLoading } = useSearchHistory();
  const { isAuthenticated } = useAuth();

  const [filters, setFilters] = useState<AdvancedSearchFiltersState>({
    searchTerm: initialFilters?.searchTerm || "",
    categoryId: initialFilters?.categoryId || "all",
    location: initialFilters?.location || "",
    latitude: initialFilters?.latitude || null,
    longitude: initialFilters?.longitude || null,
    radius: initialFilters?.radius || 50,
    minPrice: initialFilters?.minPrice || null,
    maxPrice: initialFilters?.maxPrice || null,
    minRating: initialFilters?.minRating || null,
    minExperience: initialFilters?.minExperience || null,
    sortBy: initialFilters?.sortBy || "distance",
  });

  const [gettingLocation, setGettingLocation] = useState(false);
  const [showAdvanced, setShowAdvanced] = useState(false);

  // Función para reverse geocoding
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
        const address = data.address;
        let formattedAddress = '';
        
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

        return formattedAddress.trim() || data.display_name || null;
      }
      
      return null;
    } catch (err) {
      console.error('Error en reverse geocoding:', err);
      return null;
    }
  };

  const handleGetCurrentLocation = async () => {
    setGettingLocation(true);
    try {
      const coords = await getCurrentLocation();
      const address = await reverseGeocode(coords.latitude, coords.longitude);
      
      setFilters(prev => ({
        ...prev,
        latitude: coords.latitude,
        longitude: coords.longitude,
        location: address || prev.location,
      }));
    } catch (err) {
      console.error('Error al obtener ubicación:', err);
    } finally {
      setGettingLocation(false);
    }
  };

  const handleFilterChange = (key: keyof AdvancedSearchFiltersState, value: any) => {
    setFilters(prev => {
      const newFilters = { ...prev, [key]: value };
      return newFilters;
    });
  };

  const handleClearFilters = () => {
    const clearedFilters: AdvancedSearchFiltersState = {
      searchTerm: "",
      categoryId: "all",
      location: "",
      latitude: null,
      longitude: null,
      radius: 50,
      minPrice: null,
      maxPrice: null,
      minRating: null,
      minExperience: null,
      sortBy: "distance",
    };
    setFilters(clearedFilters);
    onFiltersChange(clearedFilters);
  };

  const applyHistorySearch = (searchItem: typeof searches[0]) => {
    const newFilters: AdvancedSearchFiltersState = {
      searchTerm: searchItem.query || "",
      categoryId: searchItem.filters?.categoryId || "all",
      location: searchItem.filters?.location || "",
      latitude: searchItem.filters?.latitude || null,
      longitude: searchItem.filters?.longitude || null,
      radius: searchItem.filters?.radius || 50,
      minPrice: searchItem.filters?.minPrice || null,
      maxPrice: searchItem.filters?.maxPrice || null,
      minRating: searchItem.filters?.minRating || null,
      minExperience: searchItem.filters?.minExperience || null,
      sortBy: searchItem.filters?.sortBy || "distance",
    };
    setFilters(newFilters);
    onFiltersChange(newFilters);
  };

  // Notificar cambios de filtros (usando useRef para evitar loops infinitos)
  useEffect(() => {
    onFiltersChange(filters);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [filters]);

  const hasActiveFilters = 
    filters.categoryId !== "all" ||
    filters.location ||
    filters.minPrice !== null ||
    filters.maxPrice !== null ||
    filters.minRating !== null ||
    filters.minExperience !== null ||
    filters.radius !== 50 ||
    filters.sortBy !== "distance";

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle>Búsqueda Avanzada</CardTitle>
            <CardDescription>
              Filtra trabajadores por ubicación, categoría, precio y más
            </CardDescription>
          </div>
          <div className="flex items-center gap-2">
            {/* Botón de historial */}
            {isAuthenticated && searches.length > 0 && (
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button type="button" variant="outline" size="sm">
                    <History className="h-4 w-4 mr-2" />
                    Historial ({searches.length})
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-80">
                  <DropdownMenuLabel>Búsquedas Recientes</DropdownMenuLabel>
                  <DropdownMenuSeparator />
                  {historyLoading ? (
                    <DropdownMenuItem disabled>Cargando...</DropdownMenuItem>
                  ) : searches.length === 0 ? (
                    <DropdownMenuItem disabled>No hay búsquedas recientes</DropdownMenuItem>
                  ) : (
                    searches.slice(0, 5).map((search) => (
                      <DropdownMenuItem
                        key={search.id}
                        onClick={() => applyHistorySearch(search)}
                        className="cursor-pointer"
                      >
                        <div className="flex flex-col gap-1 w-full">
                          <div className="flex items-center justify-between">
                            <span className="font-medium truncate">
                              {search.query || "Búsqueda sin texto"}
                            </span>
                            <Clock className="h-3 w-3 text-muted-foreground ml-2 flex-shrink-0" />
                          </div>
                          <span className="text-xs text-muted-foreground">
                            {formatDistanceToNow(new Date(search.created_at), { 
                              addSuffix: true,
                              locale: es 
                            })}
                          </span>
                        </div>
                      </DropdownMenuItem>
                    ))
                  )}
                </DropdownMenuContent>
              </DropdownMenu>
            )}
            {hasActiveFilters && (
              <Button
                variant="ghost"
                size="sm"
                onClick={handleClearFilters}
                className="text-muted-foreground hover:text-foreground"
              >
                <X className="h-4 w-4 mr-1" />
                Limpiar
              </Button>
            )}
          </div>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Búsqueda básica */}
        <div className="space-y-4">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Buscar por nombre o ubicación..."
              value={filters.searchTerm}
              onChange={(e) => handleFilterChange("searchTerm", e.target.value)}
              className="pl-10"
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Categoría */}
            <div>
              <Label htmlFor="category">Categoría</Label>
              <Select
                value={filters.categoryId}
                onValueChange={(value) => handleFilterChange("categoryId", value)}
              >
                <SelectTrigger id="category">
                  <SelectValue placeholder="Todas las categorías" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Todas las categorías</SelectItem>
                  {categories.map((cat) => (
                    <SelectItem key={cat.id} value={cat.id}>
                      {cat.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Ordenar por */}
            <div>
              <Label htmlFor="sortBy">Ordenar por</Label>
              <Select
                value={filters.sortBy}
                onValueChange={(value) => handleFilterChange("sortBy", value)}
              >
                <SelectTrigger id="sortBy">
                  <SelectValue placeholder="Ordenar por" />
                </SelectTrigger>
                <SelectContent>
                  {SORT_OPTIONS.map((option) => (
                    <SelectItem key={option.value} value={option.value}>
                      {option.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
        </div>

        {/* Ubicación */}
        <div className="space-y-2 border-t pt-4">
          <Label>Ubicación</Label>
          <div className="space-y-2">
            <div className="relative">
              <MapPin className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Ej: Quito, Ecuador"
                value={filters.location}
                onChange={(e) => handleFilterChange("location", e.target.value)}
                className="pl-10 pr-12"
              />
              <Button
                type="button"
                variant="ghost"
                size="icon"
                className="absolute right-0 top-0 h-full w-12"
                onClick={handleGetCurrentLocation}
                disabled={gettingLocation}
                aria-label="Usar mi ubicación actual"
              >
                {gettingLocation ? (
                  <Navigation className="h-4 w-4 animate-spin" />
                ) : (
                  <Navigation className="h-4 w-4" />
                )}
              </Button>
            </div>
            <div>
              <Label htmlFor="radius">Radio de búsqueda</Label>
              <Select
                value={filters.radius.toString()}
                onValueChange={(value) => handleFilterChange("radius", value === "0" ? 1000 : parseInt(value))}
              >
                <SelectTrigger id="radius">
                  <SelectValue placeholder="Radio" />
                </SelectTrigger>
                <SelectContent>
                  {RADIUS_OPTIONS.map((option) => (
                    <SelectItem key={option.value} value={option.value}>
                      {option.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
        </div>

        {/* Filtros avanzados - Colapsable */}
        <div className="border-t pt-4">
          <Button
            type="button"
            variant="ghost"
            onClick={() => setShowAdvanced(!showAdvanced)}
            className="w-full justify-between"
          >
            <span>Filtros Avanzados</span>
            <span className={showAdvanced ? "rotate-180" : ""}>▼</span>
          </Button>

          {showAdvanced && (
            <div className="mt-4 space-y-4">
              {/* Precio */}
              <div className="space-y-2">
                <Label className="flex items-center gap-2">
                  <DollarSign className="h-4 w-4" />
                  Rango de Precio
                </Label>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="minPrice" className="text-xs text-muted-foreground">
                      Precio mínimo ($)
                    </Label>
                    <Input
                      id="minPrice"
                      type="number"
                      min="0"
                      placeholder="0"
                      value={filters.minPrice || ""}
                      onChange={(e) => handleFilterChange("minPrice", e.target.value ? parseFloat(e.target.value) : null)}
                    />
                  </div>
                  <div>
                    <Label htmlFor="maxPrice" className="text-xs text-muted-foreground">
                      Precio máximo ($)
                    </Label>
                    <Input
                      id="maxPrice"
                      type="number"
                      min="0"
                      placeholder="Sin límite"
                      value={filters.maxPrice || ""}
                      onChange={(e) => handleFilterChange("maxPrice", e.target.value ? parseFloat(e.target.value) : null)}
                    />
                  </div>
                </div>
              </div>

              {/* Rating */}
              <div className="space-y-2">
                <Label className="flex items-center gap-2">
                  <Star className="h-4 w-4" />
                  Rating Mínimo
                </Label>
                <Select
                  value={filters.minRating?.toString() || "0"}
                  onValueChange={(value) => handleFilterChange("minRating", value === "0" ? null : parseFloat(value))}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Rating mínimo" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="0">Sin restricción</SelectItem>
                    <SelectItem value="3">3+ estrellas</SelectItem>
                    <SelectItem value="4">4+ estrellas</SelectItem>
                    <SelectItem value="4.5">4.5+ estrellas</SelectItem>
                    <SelectItem value="5">5 estrellas</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {/* Experiencia */}
              <div className="space-y-2">
                <Label className="flex items-center gap-2">
                  <Briefcase className="h-4 w-4" />
                  Experiencia Mínima
                </Label>
                <Select
                  value={filters.minExperience?.toString() || "0"}
                  onValueChange={(value) => handleFilterChange("minExperience", value === "0" ? null : parseInt(value))}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Años de experiencia" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="0">Sin restricción</SelectItem>
                    <SelectItem value="1">1+ años</SelectItem>
                    <SelectItem value="2">2+ años</SelectItem>
                    <SelectItem value="5">5+ años</SelectItem>
                    <SelectItem value="10">10+ años</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}