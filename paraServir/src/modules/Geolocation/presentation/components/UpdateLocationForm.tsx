import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Button } from "@/shared/components/ui/button";
import { Input } from "@/shared/components/ui/input";
import { Label } from "@/shared/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/shared/components/ui/card";
import { Alert, AlertDescription } from "@/shared/components/ui/alert";
import { MapPin, Loader2, CheckCircle2, Navigation } from "lucide-react";
import { useAuth } from "@/shared/hooks/useAuth";
import { HttpClientService } from "@/shared/services/http-client.service";
import { API_CONFIG } from "@/modules/Reviews/infra/http/api.config";

const locationSchema = z.object({
  address: z.string().min(3, "La dirección debe tener al menos 3 caracteres").optional(),
  latitude: z.number().min(-90).max(90).optional(),
  longitude: z.number().min(-180).max(180).optional(),
}).refine(data => data.address || (data.latitude && data.longitude), {
  message: "Debes proporcionar una dirección o coordenadas",
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

  const getCurrentLocation = () => {
    if (!navigator.geolocation) {
      setError("Tu navegador no soporta geolocalización");
      return;
    }

    setGettingLocation(true);
    setError(null);

    navigator.geolocation.getCurrentPosition(
      (position) => {
        setValue("latitude", position.coords.latitude);
        setValue("longitude", position.coords.longitude);
        setGettingLocation(false);
      },
      (err) => {
        setError(`Error al obtener ubicación: ${err.message}`);
        setGettingLocation(false);
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
        setError("Sesión expirada. Inicia sesión nuevamente.");
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
      const errorMessage = err instanceof Error ? err.message : "Error al actualizar ubicación";
      setError(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <MapPin className="h-5 w-5" />
          Actualizar Ubicación
        </CardTitle>
        <CardDescription>
          Actualiza tu ubicación para que los clientes puedan encontrarte más fácilmente
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          {error && (
            <Alert variant="destructive">
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}

          {success && (
            <Alert className="bg-green-50 border-green-200">
              <CheckCircle2 className="h-4 w-4 text-green-600" />
              <AlertDescription className="text-green-800">
                Ubicación actualizada correctamente
              </AlertDescription>
            </Alert>
          )}

          <div className="space-y-2">
            <Label htmlFor="address">Dirección</Label>
            <Input
              id="address"
              placeholder="Ej: Quito, Ecuador"
              {...register("address")}
              onPaste={(e) => {
                // Permitir pegar texto normalmente
                const pastedText = e.clipboardData.getData('text');
                if (pastedText) {
                  const { onChange } = register("address");
                  onChange({ target: { value: pastedText } });
                }
              }}
            />
            {errors.address && (
              <p className="text-sm text-destructive">{errors.address.message}</p>
            )}
            <p className="text-xs text-muted-foreground">
              Puedes escribir una dirección y se convertirá automáticamente en coordenadas
            </p>
          </div>

          <div className="relative">
            <div className="absolute inset-0 flex items-center">
              <span className="w-full border-t" />
            </div>
            <div className="relative flex justify-center text-xs uppercase">
              <span className="bg-background px-2 text-muted-foreground">O</span>
            </div>
          </div>

          <Button
            type="button"
            variant="outline"
            onClick={getCurrentLocation}
            disabled={gettingLocation}
            className="w-full"
          >
            <Navigation className="mr-2 h-4 w-4" />
            {gettingLocation ? "Obteniendo ubicación..." : "Usar mi ubicación actual"}
          </Button>

          {(watch("latitude") || watch("longitude")) && (
            <div className="p-3 bg-muted rounded-lg text-sm">
              <p className="font-medium mb-1">Coordenadas:</p>
              <p>Latitud: {watch("latitude")?.toFixed(6)}</p>
              <p>Longitud: {watch("longitude")?.toFixed(6)}</p>
            </div>
          )}

          <Button type="submit" disabled={loading} className="w-full">
            {loading ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Actualizando...
              </>
            ) : (
              "Actualizar Ubicación"
            )}
          </Button>
        </form>
      </CardContent>
    </Card>
  );
}
