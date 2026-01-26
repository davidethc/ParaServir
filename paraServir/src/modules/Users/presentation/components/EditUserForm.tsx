import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { Button } from "@/shared/components/ui/button";
import { Input } from "@/shared/components/ui/input";
import { Label } from "@/shared/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/shared/components/ui/card";
import { Alert, AlertDescription } from "@/shared/components/ui/alert";
import { UpdateUserUseCase } from "../../application/use-cases/update-user.use-case";
import type { UpdateUserDto } from "../../application/dto/update-user.dto";
import type { UserDto } from "../../application/dto/user.dto";
import { useAuth } from "@/shared/hooks/useAuth";
import { AlertCircle, Loader2, Save, Navigation } from "lucide-react";

const updateUserSchema = z.object({
  full_name: z.string().min(2, "El nombre debe tener al menos 2 caracteres"),
  email: z.string().email("Email inválido"),
  phone: z.string().min(10, "El teléfono debe tener al menos 10 caracteres"),
  location: z.string().optional(),
  cedula: z.union([
    z.string().min(10, "La cédula debe tener al menos 10 caracteres"),
    z.literal(""),
    z.null(),
  ]).optional(),
  // NO incluir role, password, avatar_url aquí - se manejan por separado
});

interface EditUserFormProps {
  user: UserDto;
  onSuccess?: (updatedUser: UserDto) => void;
  onCancel?: () => void;
}

export function EditUserForm({ user, onSuccess, onCancel }: EditUserFormProps) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  const [gettingLocation, setGettingLocation] = useState(false);
  const { getToken } = useAuth();
  const useCase = new UpdateUserUseCase();

  // Construir nombre completo desde first_name y last_name
  const getFullName = () => {
    const parts = [user.first_name, user.last_name].filter(Boolean);
    return parts.join(" ").trim() || "";
  };

  const {
    register,
    handleSubmit,
    formState: { errors, isDirty },
    reset,
    setValue,
  } = useForm<{ full_name: string; email: string; phone: string; location?: string; cedula?: string | null }>({
    resolver: zodResolver(updateUserSchema),
    defaultValues: {
      full_name: getFullName(),
      email: user.email,
      phone: user.phone,
      location: user.location || "",
      cedula: user.cedula,
    },
  });

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

  // Obtener ubicación actual del usuario
  const handleGetCurrentLocation = async () => {
    if (!navigator.geolocation) {
      setError("Tu navegador no soporta geolocalización");
      return;
    }

    setGettingLocation(true);
    setError(null);

    try {
      // Obtener coordenadas GPS
      navigator.geolocation.getCurrentPosition(
        async (position) => {
          const { latitude, longitude } = position.coords;
          
          // Convertir coordenadas a dirección (calles)
          const address = await reverseGeocode(latitude, longitude);
          
          if (address) {
            setValue("location", address);
          } else {
            setError("No se pudo obtener la dirección. Puedes escribirla manualmente.");
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
    } catch (err) {
      setError("Error al obtener la ubicación. Puedes escribirla manualmente.");
      setGettingLocation(false);
    }
  };

  // Dividir nombre completo en first_name y last_name
  const splitFullName = (fullName: string): { first_name: string; last_name: string } => {
    const trimmed = fullName.trim();
    if (!trimmed) {
      return { first_name: "", last_name: "" };
    }

    // Dividir por espacios
    const parts = trimmed.split(/\s+/).filter(Boolean);
    
    if (parts.length === 0) {
      return { first_name: "", last_name: "" };
    } else if (parts.length === 1) {
      // Solo un nombre, todo va a first_name
      return { first_name: parts[0], last_name: "" };
    } else {
      // Primer nombre va a first_name, el resto a last_name
      return {
        first_name: parts[0],
        last_name: parts.slice(1).join(" ")
      };
    }
  };

  const onSubmit = async (data: { full_name: string; email: string; phone: string; location?: string; cedula?: string | null }) => {
    setLoading(true);
    setError(null);
    setSuccess(false);

    try {
      const token = getToken();
      if (!token) {
        setError("No hay sesión activa. Por favor inicia sesión.");
        return;
      }

      // Dividir nombre completo
      const { first_name, last_name } = splitFullName(data.full_name);

      // Preparar datos para actualización (solo campos permitidos)
      const updateData: UpdateUserDto = {
        first_name: first_name || user.first_name, // Si está vacío, mantener el actual
        last_name: last_name || null, // Permitir vacío/null
        email: data.email,
        phone: data.phone,
        location: data.location || null,
        cedula: data.cedula || null,
        // NO incluir: role, password, avatar_url (se manejan por separado)
      };

      const updatedUser = await useCase.execute(user.id, updateData, token);
      
      setSuccess(true);
      reset({
        full_name: getFullNameFromUser(updatedUser),
        email: updatedUser.email,
        phone: updatedUser.phone,
        location: updatedUser.location || "",
        cedula: updatedUser.cedula,
      });
      
      // Ocultar mensaje de éxito después de 3 segundos
      setTimeout(() => setSuccess(false), 3000);
      
      if (onSuccess) {
        onSuccess(updatedUser);
      }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : "Error al actualizar el perfil";
      setError(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  // Helper para obtener nombre completo desde UserDto
  const getFullNameFromUser = (userData: UserDto): string => {
    const parts = [userData.first_name, userData.last_name].filter(Boolean);
    return parts.join(" ").trim() || "";
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Editar Perfil</CardTitle>
        <CardDescription>
          Actualiza tu información personal
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          {error && (
            <Alert variant="destructive">
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}

          {success && (
            <Alert className="bg-green-50 text-green-900 border-green-200">
              <AlertDescription>Perfil actualizado correctamente</AlertDescription>
            </Alert>
          )}

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="full_name">Nombre *</Label>
              <Input
                id="full_name"
                {...register("full_name")}
                placeholder="Tu nombre completo"
                disabled={loading}
              />
              {errors.full_name && (
                <p className="text-sm text-destructive">{errors.full_name.message}</p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="email">Email *</Label>
              <Input
                id="email"
                type="email"
                {...register("email")}
                placeholder="tu@email.com"
                disabled={loading}
              />
              {errors.email && (
                <p className="text-sm text-destructive">{errors.email.message}</p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="phone">Teléfono *</Label>
              <Input
                id="phone"
                {...register("phone")}
                placeholder="0999999999"
                disabled={loading}
              />
              {errors.phone && (
                <p className="text-sm text-destructive">{errors.phone.message}</p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="cedula">Cédula *</Label>
              <Input
                id="cedula"
                {...register("cedula")}
                placeholder="1712345678"
                disabled={loading}
              />
              {errors.cedula && (
                <p className="text-sm text-destructive">{errors.cedula.message}</p>
              )}
            </div>

            <div className="space-y-2 md:col-span-2">
              <Label htmlFor="location">Ubicación</Label>
              <div className="relative">
                <Input
                  id="location"
                  {...register("location")}
                  placeholder="Av. Principal 123, Quito, Ecuador"
                  disabled={loading}
                  className="pr-12"
                  onPaste={(e) => {
                    // Permitir pegar texto normalmente
                    const pastedText = e.clipboardData.getData('text');
                    if (pastedText) {
                      // Actualizar el valor del formulario con el texto pegado
                      const { onChange } = register("location");
                      onChange({ target: { value: pastedText } });
                    }
                  }}
                />
                <Button
                  type="button"
                  variant="ghost"
                  size="icon"
                  className="absolute right-1 top-1/2 -translate-y-1/2 h-8 w-8"
                  onClick={handleGetCurrentLocation}
                  disabled={loading || gettingLocation}
                  title="Obtener mi ubicación automáticamente"
                  aria-label="Obtener ubicación actual"
                >
                  {gettingLocation ? (
                    <Loader2 className="h-4 w-4 animate-spin text-primary" />
                  ) : (
                    <Navigation className="h-4 w-4 text-primary" />
                  )}
                </Button>
              </div>
              <p className="text-xs text-muted-foreground">
                Haz clic en el icono de navegación para obtener tu ubicación automáticamente
              </p>
              {errors.location && (
                <p className="text-sm text-destructive">{errors.location.message}</p>
              )}
            </div>
          </div>

          <div className="flex justify-end gap-3 pt-4">
            <Button
              type="button"
              variant="outline"
              onClick={() => {
                reset();
                if (onCancel) {
                  onCancel();
                }
              }}
              disabled={loading}
            >
              Cancelar
            </Button>
            <Button type="submit" disabled={loading || !isDirty} className="bg-[#2FB8A8] hover:bg-[#2FB8A8]/90 text-white">
              {loading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Guardando...
                </>
              ) : (
                <>
                  <Save className="mr-2 h-4 w-4" />
                  Guardar Cambios
                </>
              )}
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  );
}
