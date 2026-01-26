import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Button } from "@/shared/components/ui/button";
import { Input } from "@/shared/components/ui/input";
import { Label } from "@/shared/components/ui/label";
import { Alert, AlertDescription } from "@/shared/components/ui/alert";
import { MapPin, Loader2, CheckCircle2, Navigation, Search, Sparkles, AlertCircle } from "lucide-react";
import { useAuth } from "@/shared/hooks/useAuth";
import { HttpClientService } from "@/shared/services/http-client.service";
import { API_CONFIG } from "@/modules/Reviews/infra/http/api.config";
import { cn } from "@/shared/lib/utils";

const locationSchema = z.object({
  address: z.string().min(3, "La direcci?n debe tener al menos 3 caracteres").optional(),
  latitude: z.number().min(-90).max(90).optional(),
  longitude: z.number().min(-180).max(180).optional(),
}).refine(data => data.address || (data.latitude && data.longitude), {
  message: "Debes proporcionar una direcci?n o coordenadas",
});

type LocationFormData = z.infer<typeof locationSchema>;

export function UpdateLocationForm() {
  const { getToken } = useAuth();
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [gettingLocation, setGettingLocation] = useState(false);

  const {
    register,
    handleSubmit,
    setValue,
    watch,
    formState: { errors },
  } = useForm<LocationFormData>({
    resolver: zodResolver(locationSchema),
  });

  const address = watch("address");

  // Funci?n para reverse geocoding: convertir coordenadas a direcci?n
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
        throw new Error('Error al obtener la direcci?n');
      }

      const data = await response.json();
      
      if (data && data.address) {
        // Construir direcci?n legible con calle, ciudad, etc.
        const address = data.address;
        let formattedAddress = '';
        
        // Priorizar: calle > ciudad > estado > pa?s
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

        // Si no hay direcci?n formateada, usar display_name completo
        return formattedAddress.trim() || data.display_name || null;
      }
      
      return null;
    } catch (err) {
      console.error('Error en reverse geocoding:', err);
      return null;
    }
  };

  const getCurrentLocation = async () => {
    if (!navigator.geolocation) {
      setError("Tu navegador no soporta geolocalizaci?n");
      return;
    }

    setGettingLocation(true);
    setError(null);

    navigator.geolocation.getCurrentPosition(
      async (position) => {
        const lat = position.coords.latitude;
        const lng = position.coords.longitude;
        
        // Guardar coordenadas
        setValue("latitude", lat);
        setValue("longitude", lng);
        
        // Convertir coordenadas a direcci?n de calles
        const address = await reverseGeocode(lat, lng);
        
        if (address) {
          setValue("address", address);
        } else {
          setError("No se pudo obtener la direcci?n. Puedes escribirla manualmente.");
        }
        
        setGettingLocation(false);
      },
      (err) => {
        // Manejar errores de manera más amigable
        const errorMessage = err.code === 1 
          ? "Permisos de ubicación denegados. Puedes escribirla manualmente."
          : err.code === 3
          ? "Tiempo de espera agotado. Puedes escribirla manualmente."
          : `Error al obtener ubicación: ${err.message}. Puedes escribirla manualmente.`;
        setError(errorMessage);
        setGettingLocation(false);
      },
      {
        enableHighAccuracy: true,
        timeout: 10000,
        maximumAge: 0
      }
    );
  };

  const onSubmit = async (data: LocationFormData) => {
    setLoading(true);
    setError(null);
    setSuccess(false);

    try {
      const token = getToken();
      if (!token) {
        setError("Sesi?n expirada. Inicia sesi?n nuevamente.");
        return;
      }

      const httpClient = new HttpClientService({ baseUrl: API_CONFIG.baseUrl });
      await httpClient.put(
        "/workers/location",
        {
          address: data.address || undefined,
          latitude: data.latitude || undefined,
          longitude: data.longitude || undefined,
        },
        { Authorization: `Bearer ${token}` }
      );

      setSuccess(true);
      setTimeout(() => setSuccess(false), 3000);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : "Error al actualizar ubicaci?n";
      setError(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Success/Error Messages */}
      {error && (
        <Alert variant="destructive" className="animate-in slide-in-from-top-2 duration-300">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      {success && (
        <Alert className="bg-gradient-to-r from-green-50 to-emerald-50 border-green-200 animate-in slide-in-from-top-2 duration-300">
          <CheckCircle2 className="h-4 w-4 text-green-600" />
          <AlertDescription className="text-green-800 font-medium">
            ¡Ubicación actualizada correctamente! Los clientes podrán encontrarte más fácilmente.
          </AlertDescription>
        </Alert>
      )}

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
        {/* Manual Input Section */}
        <div className="space-y-3">
          <div className="flex items-center gap-2 mb-2">
            <Search className="h-5 w-5 text-[#58A3B0]" />
            <Label htmlFor="address" className="text-base font-semibold text-foreground">
              Escribe tu dirección
            </Label>
          </div>
          
          <div className="relative group">
            <div className="absolute inset-0 bg-gradient-to-r from-[#58A3B0]/10 to-[#2FB8A8]/10 rounded-xl blur-sm opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
            <div className="relative">
              <Input
                id="address"
                placeholder="Ej: Av. Amazonas N12-234, Quito, Pichincha, Ecuador"
                {...register("address")}
                onPaste={(e) => {
                  const pastedText = e.clipboardData.getData('text');
                  if (pastedText) {
                    const { onChange } = register("address");
                    onChange({ target: { value: pastedText } });
                  }
                }}
                className={cn(
                  "h-12 text-base pr-14 border-2 transition-all duration-200",
                  "focus:border-[#58A3B0] focus:ring-2 focus:ring-[#58A3B0]/20",
                  errors.address ? "border-destructive" : "border-border",
                  address ? "bg-white" : "bg-[#F9FAFE]"
                )}
              />
              <Button
                type="button"
                variant="ghost"
                size="icon"
                onClick={getCurrentLocation}
                disabled={gettingLocation}
                className={cn(
                  "absolute right-2 top-1/2 -translate-y-1/2 h-8 w-8 rounded-lg",
                  "hover:bg-[#58A3B0]/10 hover:text-[#58A3B0] transition-all duration-200",
                  gettingLocation && "animate-pulse"
                )}
                aria-label="Obtener ubicación automáticamente"
                title="Obtener ubicación automáticamente"
              >
                {gettingLocation ? (
                  <Loader2 className="h-4 w-4 animate-spin text-[#58A3B0]" />
                ) : (
                  <Navigation className="h-4 w-4" />
                )}
              </Button>
            </div>
          </div>
          
          {errors.address && (
            <p className="text-sm text-destructive animate-in slide-in-from-left-1 duration-200">
              {errors.address.message}
            </p>
          )}
          
          <p className="text-xs text-muted-foreground flex items-start gap-2">
            <span className="mt-0.5">💡</span>
            <span>
              Puedes escribir tu dirección completa o hacer clic en el icono de navegación 
              <Navigation className="inline h-3 w-3 mx-1" /> para obtenerla automáticamente
            </span>
          </p>
        </div>

        {/* Divider */}
        <div className="relative my-6">
          <div className="absolute inset-0 flex items-center">
            <span className="w-full border-t border-border" />
          </div>
          <div className="relative flex justify-center text-xs uppercase">
            <span className="bg-white px-4 text-muted-foreground font-medium">O usa una opción rápida</span>
          </div>
        </div>

        {/* Quick Actions */}
        <div className="grid gap-4">
          {/* Auto-detect Button */}
          <Button
            type="button"
            variant="outline"
            onClick={getCurrentLocation}
            disabled={gettingLocation || loading}
            className={cn(
              "h-14 w-full border-2 transition-all duration-300",
              "hover:border-[#58A3B0] hover:bg-[#58A3B0]/5 hover:shadow-md hover:scale-[1.02]",
              "disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100",
              gettingLocation && "border-[#58A3B0] bg-[#58A3B0]/5"
            )}
          >
            <div className="flex items-center gap-3">
              <div className={cn(
                "p-2 rounded-lg transition-colors duration-200",
                gettingLocation ? "bg-[#58A3B0]/10" : "bg-[#58A3B0]/5"
              )}>
                {gettingLocation ? (
                  <Loader2 className="h-5 w-5 animate-spin text-[#58A3B0]" />
                ) : (
                  <Navigation className="h-5 w-5 text-[#58A3B0]" />
                )}
              </div>
              <div className="flex-1 text-left">
                <div className="font-semibold text-base">
                  {gettingLocation ? "Obteniendo tu ubicación..." : "Usar mi ubicación actual"}
                </div>
                <div className="text-xs text-muted-foreground">
                  Detecta automáticamente tu ubicación con GPS
                </div>
              </div>
              {!gettingLocation && (
                <Sparkles className="h-4 w-4 text-[#58A3B0] opacity-50" />
              )}
            </div>
          </Button>
        </div>

        {/* Submit Button */}
        <Button 
          type="submit" 
          disabled={loading || gettingLocation || !address} 
          className={cn(
            "h-12 w-full text-base font-semibold transition-all duration-300",
            "bg-gradient-to-r from-[#58A3B0] to-[#2FB8A8] hover:from-[#58A3B0]/90 hover:to-[#2FB8A8]/90",
            "hover:shadow-lg hover:scale-[1.02] active:scale-[0.98]",
            "disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100"
          )}
        >
          {loading ? (
            <>
              <Loader2 className="mr-2 h-5 w-5 animate-spin" />
              Guardando ubicación...
            </>
          ) : (
            <>
              <MapPin className="mr-2 h-5 w-5" />
              Guardar Ubicación
            </>
          )}
        </Button>

        {/* Helper Info */}
        {!address && (
          <div className="p-4 bg-blue-50/50 border border-blue-200 rounded-xl">
            <p className="text-sm text-blue-900 flex items-start gap-2">
              <MapPin className="h-4 w-4 mt-0.5 text-blue-600 flex-shrink-0" />
              <span>
                <strong>¿Por qué es importante?</strong> Tu ubicación ayuda a los clientes a encontrarte 
                más fácilmente cuando buscan servicios cerca de su área.
              </span>
            </p>
          </div>
        )}
      </form>
    </div>
  );
}
