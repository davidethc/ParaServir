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
import { AlertCircle, Loader2, Save } from "lucide-react";

const updateUserSchema = z.object({
  first_name: z.string().min(2, "El nombre debe tener al menos 2 caracteres"),
  last_name: z.string().min(2, "El apellido debe tener al menos 2 caracteres"),
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
  const { getToken } = useAuth();
  const useCase = new UpdateUserUseCase();

  const {
    register,
    handleSubmit,
    formState: { errors, isDirty },
    reset,
  } = useForm<UpdateUserDto>({
    resolver: zodResolver(updateUserSchema),
    defaultValues: {
      first_name: user.first_name,
      last_name: user.last_name,
      email: user.email,
      phone: user.phone,
      location: user.location || "",
      cedula: user.cedula,
    },
  });

  const onSubmit = async (data: UpdateUserDto) => {
    setLoading(true);
    setError(null);
    setSuccess(false);

    try {
      const token = getToken();
      if (!token) {
        setError("No hay sesión activa. Por favor inicia sesión.");
        return;
      }

      // Preparar datos para actualización (solo campos permitidos)
      const updateData: UpdateUserDto = {
        first_name: data.first_name,
        last_name: data.last_name,
        email: data.email,
        phone: data.phone,
        location: data.location || null,
        cedula: data.cedula || null,
        // NO incluir: role, password, avatar_url (se manejan por separado)
      };

      const updatedUser = await useCase.execute(user.id, updateData, token);
      
      setSuccess(true);
      reset(updateData as any);
      
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
              <Label htmlFor="first_name">Nombre *</Label>
              <Input
                id="first_name"
                {...register("first_name")}
                placeholder="Tu nombre"
                disabled={loading}
              />
              {errors.first_name && (
                <p className="text-sm text-destructive">{errors.first_name.message}</p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="last_name">Apellido *</Label>
              <Input
                id="last_name"
                {...register("last_name")}
                placeholder="Tu apellido"
                disabled={loading}
              />
              {errors.last_name && (
                <p className="text-sm text-destructive">{errors.last_name.message}</p>
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

            <div className="space-y-2">
              <Label htmlFor="location">Ubicación</Label>
              <Input
                id="location"
                {...register("location")}
                placeholder="Ciudad, País"
                disabled={loading}
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
            <Button type="submit" disabled={loading || !isDirty}>
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

