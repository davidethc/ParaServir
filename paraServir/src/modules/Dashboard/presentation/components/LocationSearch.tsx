import { useState } from "react";
import { Input } from "@/shared/components/ui/input";
import { Button } from "@/shared/components/ui/button";
import { Label } from "@/shared/components/ui/label";
import { MapPin, Navigation, X, Search } from "lucide-react";
import { useGeolocation } from "@/shared/hooks/useGeolocation";
import { HttpClientService } from "@/shared/services/http-client.service";
import { API_CONFIG } from "@/modules/Reviews/infra/http/api.config";

interface LocationSearchProps {
  onLocationChange: (location: { address?: string; latitude?: number; longitude?: number }) => void;
  initialLocation?: { address?: string; latitude?: number; longitude?: number };
}

export function LocationSearch({ onLocationChange, initialLocation }: LocationSearchProps) {
  const [address, setAddress] = useState(initialLocation?.address || "");
  const [latitude, setLatitude] = useState<number | undefined>(initialLocation?.latitude);
  const [longitude, setLongitude] = useState<number | undefined>(initialLocation?.longitude);
  const [gettingLocation, setGettingLocation] = useState(false);
  const [searching, setSearching] = useState(false);
  const { getCurrentLocation } = useGeolocation();

  const handleGetCurrentLocation = async () => {
    setGettingLocation(true);
    try {
      const coords = await getCurrentLocation();
      setLatitude(coords.latitude);
      setLongitude(coords.longitude);
      // getCurrentLocation solo retorna coordenadas, no dirección
      // La dirección se puede obtener después mediante reverse geocoding si es necesario
      onLocationChange({
        latitude: coords.latitude,
        longitude: coords.longitude,
      });
    } catch (err) {
      console.error("Error al obtener ubicación:", err);
    } finally {
      setGettingLocation(false);
    }
  };

  const handleSearch = async () => {
    if (!address.trim()) {
      return;
    }

    setSearching(true);
    try {
      const httpClient = new HttpClientService({ baseUrl: API_CONFIG.baseUrl });
      // Usar el endpoint de geocodificación del backend
      const response = await httpClient.get<{ 
        status: string; 
        search_location?: { latitude: number; longitude: number; formatted_address?: string };
        location?: { latitude: number; longitude: number; formatted_address?: string };
      } | null>(
        `/workers/search?location=${encodeURIComponent(address)}`,
        {}
      );
      if (response) {
        const locationData = response.search_location || response.location;
        if (locationData) {
          setLatitude(locationData.latitude);
          setLongitude(locationData.longitude);
          if (locationData.formatted_address) {
            setAddress(locationData.formatted_address);
          }
          onLocationChange({
            address: locationData.formatted_address || address,
            latitude: locationData.latitude,
            longitude: locationData.longitude,
          });
        }
      }
    } catch (err) {
      console.error("Error al buscar ubicación:", err);
      // Si falla, solo usar la dirección sin coordenadas
      onLocationChange({ address: address });
    } finally {
      setSearching(false);
    }
  };

  const handleAddressChange = (value: string) => {
    setAddress(value);
    // Limpiar coordenadas cuando cambia la dirección
    if (!value.trim()) {
      setLatitude(undefined);
      setLongitude(undefined);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      handleSearch();
    }
  };

  const handleClear = () => {
    setAddress("");
    setLatitude(undefined);
    setLongitude(undefined);
    onLocationChange({});
  };

  return (
    <div className="space-y-2">
      <Label className="text-sm font-medium">Buscar por ubicación (opcional)</Label>
      <div className="flex gap-2">
        <div className="relative flex-1">
          <MapPin className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            type="text"
            placeholder="Ej: Quito, Ecuador"
            value={address}
            onChange={(e) => handleAddressChange(e.target.value)}
            onKeyPress={handleKeyPress}
            onPaste={(e) => {
              // Permitir pegar texto normalmente
              const pastedText = e.clipboardData.getData('text');
              if (pastedText) {
                setAddress(pastedText);
              }
            }}
            className="pl-9 pr-9"
          />
          {address && (
            <button
              type="button"
              onClick={handleClear}
              className="absolute right-3 top-1/2 transform -translate-y-1/2 text-muted-foreground hover:text-foreground"
            >
              <X className="h-4 w-4" />
            </button>
          )}
        </div>
        <Button
          type="button"
          variant="default"
          onClick={handleSearch}
          disabled={searching || !address.trim()}
          className="px-4"
        >
          <Search className={`h-4 w-4 mr-2 ${searching ? 'animate-spin' : ''}`} />
          Buscar
        </Button>
        <Button
          type="button"
          variant="outline"
          onClick={handleGetCurrentLocation}
          disabled={gettingLocation}
          size="icon"
          title="Usar mi ubicación actual"
        >
          <Navigation className={`h-4 w-4 ${gettingLocation ? 'animate-spin' : ''}`} />
        </Button>
      </div>
      {(latitude || longitude) && (
        <p className="text-xs text-muted-foreground">
          Buscando trabajadores cerca de: {typeof latitude === 'number' ? latitude.toFixed(4) : latitude}, {typeof longitude === 'number' ? longitude.toFixed(4) : longitude}
        </p>
      )}
    </div>
  );
}
