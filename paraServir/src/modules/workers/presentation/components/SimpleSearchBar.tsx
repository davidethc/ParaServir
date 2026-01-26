import { useState, FormEvent, useEffect } from "react";
import { Search, MapPin, Star } from "lucide-react";
import { Input } from "@/shared/components/ui/input";
import { Button } from "@/shared/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/shared/components/ui/select";
import { useCategories } from "@/shared/hooks/useCategories";
import { useGeolocation } from "@/shared/hooks/useGeolocation";

interface SimpleSearchBarProps {
  onSearch: (filters: {
    categoryId?: string;
    location?: string;
    minRating?: number;
  }) => void;
  initialCategory?: string;
  initialLocation?: string;
}

export function SimpleSearchBar({
  onSearch,
  initialCategory = "all",
  initialLocation = "",
}: SimpleSearchBarProps) {
  const { categories } = useCategories();
  const { getCurrentLocation } = useGeolocation();
  
  const [categoryId, setCategoryId] = useState(initialCategory);
  const [location, setLocation] = useState(initialLocation);
  const [onlyBestRated, setOnlyBestRated] = useState(false);
  const [gettingLocation, setGettingLocation] = useState(false);
  const [locationError, setLocationError] = useState(false);

  // Sincronizar con props iniciales cuando cambian
  useEffect(() => {
    setCategoryId(initialCategory || "all");
    setLocation(initialLocation || "");
  }, [initialCategory, initialLocation]);

  // Obtener ubicación automáticamente al cargar si no hay ubicación inicial
  useEffect(() => {
    if (!initialLocation) {
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
                    setLocation(address);
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
      };

      void getCurrentLocationAuto();
    }
  }, [initialLocation]);

  const handleGetLocation = async () => {
    setGettingLocation(true);
    try {
      const coords = await getCurrentLocation();
      // Reverse geocoding
      try {
        const response = await fetch(
          `https://nominatim.openstreetmap.org/reverse?lat=${coords.latitude}&lon=${coords.longitude}&format=json&addressdetails=1`,
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
              setLocation(address);
            }
          }
        }
      } catch (err) {
        // Silenciar errores esperados de geocoding
      }
    } catch (err) {
      // Silenciar errores esperados de geolocalización
      // Solo loguear errores críticos en desarrollo
      if (process.env.NODE_ENV === 'development') {
        const error = err as Error;
        if (!error.message.includes("Permisos") && !error.message.includes("Tiempo")) {
          console.warn("Geolocation error:", error.message);
        }
      }
    } finally {
      setGettingLocation(false);
    }
  };

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();
    onSearch({
      categoryId: categoryId !== "all" ? categoryId : undefined,
      location: location || undefined,
      minRating: onlyBestRated ? 4.5 : undefined,
    });
  };

  return (
    <div className="w-full">
      <form onSubmit={handleSubmit} className="space-y-4">
        {/* FILTROS EN LAYOUT HORIZONTAL MEJORADO */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {/* FILTRO 1: Categoría */}
          <div>
            <label className="text-sm font-semibold text-foreground mb-2 block flex items-center gap-2">
              <Search className="h-4 w-4 text-[#58A3B0]" />
              Categoría
            </label>
            <Select value={categoryId} onValueChange={setCategoryId}>
              <SelectTrigger className="h-12 text-sm border-2 border-border rounded-xl hover:border-[#58A3B0]">
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

          {/* FILTRO 2: Ubicación */}
          <div>
            <label className="text-sm font-semibold text-foreground mb-2 block flex items-center gap-2">
              <MapPin className="h-4 w-4 text-[#58A3B0]" />
              Ubicación
            </label>
            <div className="relative">
              <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                type="text"
                placeholder="Ej: Quito, Ecuador"
                value={location}
                onChange={(e) => setLocation(e.target.value)}
                className="pl-10 pr-10 h-12 text-sm border-2 border-border rounded-xl focus:border-[#58A3B0] focus:ring-2 focus:ring-[#58A3B0]/20"
              />
              {/* Mostrar botón solo si falló la detección automática o si el usuario quiere actualizar */}
              {(locationError || !gettingLocation) && (
                <Button
                  type="button"
                  variant="ghost"
                  size="icon"
                  className="absolute right-1 top-1/2 -translate-y-1/2 h-9 w-9 hover:bg-[#58A3B0]/10 rounded-lg"
                  onClick={handleGetLocation}
                  disabled={gettingLocation}
                  title="Usar mi ubicación actual"
                >
                  {gettingLocation ? (
                    <div className="h-3.5 w-3.5 border-2 border-[#58A3B0] border-t-transparent rounded-full animate-spin" />
                  ) : (
                    <MapPin className="h-3.5 w-3.5 text-[#58A3B0]" />
                  )}
                </Button>
              )}
              {gettingLocation && !locationError && (
                <div className="absolute right-3 top-1/2 -translate-y-1/2">
                  <div className="h-3.5 w-3.5 border-2 border-[#58A3B0] border-t-transparent rounded-full animate-spin" />
                </div>
              )}
            </div>
          </div>

          {/* FILTRO 3: Calificación */}
          <div>
            <label className="text-sm font-semibold text-foreground mb-2 block flex items-center gap-2">
              <Star className="h-4 w-4 text-[#58A3B0]" />
              Calificación
            </label>
            <Select 
              value={onlyBestRated ? "best" : "all"} 
              onValueChange={(value) => setOnlyBestRated(value === "best")}
            >
              <SelectTrigger className="h-12 text-sm border-2 border-border rounded-xl">
                <SelectValue placeholder="Todas las calificaciones" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Todas las calificaciones</SelectItem>
                <SelectItem value="best">⭐ Mejor calificados (4.5+)</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        {/* Botón Buscar */}
        <div className="flex justify-center pt-2">
          <Button
            type="submit"
            className="bg-[#58A3B0] hover:bg-[#58A3B0]/90 text-white h-12 px-10 rounded-xl font-semibold text-base shadow-md hover:shadow-lg transition-all"
          >
            <Search className="h-5 w-5 mr-2" />
            Buscar Trabajadores
          </Button>
        </div>
      </form>
    </div>
  );
}
