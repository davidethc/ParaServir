import { useState, useEffect, useMemo } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/shared/components/ui/card";
import { Label } from "@/shared/components/ui/label";
import { Input } from "@/shared/components/ui/input";
import { Button } from "@/shared/components/ui/button";
import { Checkbox } from "@/shared/components/ui/checkbox";
import { Alert, AlertDescription } from "@/shared/components/ui/alert";
import { AvailabilityController } from "@/modules/Availability/infra/http/controllers/availability.controller";
import type { AvailabilityDayDto } from "@/modules/Availability/application/dto/availability.dto";
import { DAY_NAMES } from "@/modules/Availability/application/dto/availability.dto";
import { useAuth } from "@/shared/hooks/useAuth";
import { useMe } from "@/shared/hooks/useMe";
import { Calendar, Clock, Loader2, AlertCircle, CheckCircle2 } from "lucide-react";
import { toast } from "sonner";

interface AvailabilityCalendarProps {
  workerId?: string; // Si se proporciona, es para ver disponibilidad de otro trabajador (solo lectura)
  readonly?: boolean;
  onSave?: () => void;
}

export function AvailabilityCalendar({ workerId, readonly = false, onSave }: AvailabilityCalendarProps) {
  const { getToken } = useAuth();
  const { user: currentUser, loading: meLoading } = useMe();
  const [availability, setAvailability] = useState<AvailabilityDayDto[]>([]);
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const availabilityController = useMemo(() => new AvailabilityController(), []);
  
  // Determinar el workerId a usar: prop primero, luego usuario autenticado
  const targetWorkerId = workerId || currentUser?.id || undefined;

  // Inicializar con todos los días de la semana
  const initializeAvailability = (): AvailabilityDayDto[] => {
    return Array.from({ length: 7 }, (_, index) => ({
      day_of_week: index,
      start_time: index >= 1 && index <= 5 ? "09:00" : null, // Lunes-Viernes: 9 AM por defecto
      end_time: index >= 1 && index <= 5 ? "18:00" : null, // Lunes-Viernes: 6 PM por defecto
      is_available: index >= 1 && index <= 5, // Disponible Lunes-Viernes por defecto
    }));
  };

  // Cargar disponibilidad existente
  useEffect(() => {
    const loadAvailability = async () => {
      // Si está cargando el usuario (y no tenemos workerId como prop), esperar
      if (!workerId && meLoading) {
        return;
      }

      // Si no hay workerId (ni pasado como prop ni del usuario autenticado), inicializar valores por defecto
      if (!targetWorkerId) {
        setAvailability(initializeAvailability());
        return;
      }

      setLoading(true);
      setError(null);
      
      try {
        const response = await availabilityController.getByWorkerId(targetWorkerId);
        if (response.availability && response.availability.length > 0) {
          // Ordenar por day_of_week
          const sorted = [...response.availability].sort((a, b) => a.day_of_week - b.day_of_week);
          // Asegurar que todos los días estén presentes
          const allDays = initializeAvailability();
          sorted.forEach(item => {
            const dayIndex = allDays.findIndex(d => d.day_of_week === item.day_of_week);
            if (dayIndex !== -1) {
              allDays[dayIndex] = {
                ...item,
                start_time: item.start_time || null,
                end_time: item.end_time || null,
              };
            }
          });
          setAvailability(allDays);
        } else {
          // No hay disponibilidad configurada, usar valores por defecto
          setAvailability(initializeAvailability());
        }
      } catch (err) {
        // Si no existe disponibilidad o hay error, usar valores por defecto
        setAvailability(initializeAvailability());
        if (readonly) {
          // Solo mostrar error en modo lectura (al ver perfil de otro trabajador)
          const errorMessage = err instanceof Error ? err.message : "Error al cargar disponibilidad";
          setError(errorMessage);
        }
        // En modo edición, silenciosamente usar valores por defecto (es la primera vez que configura)
      } finally {
        setLoading(false);
      }
    };

    void loadAvailability();
  }, [targetWorkerId, readonly, availabilityController, workerId, meLoading]);

  const handleDayToggle = (dayIndex: number) => {
    if (readonly) return;

    setAvailability(prev => prev.map((day, index) => {
      if (index === dayIndex) {
        const newIsAvailable = !day.is_available;
        return {
          ...day,
          is_available: newIsAvailable,
          // Si se activa un día, establecer horarios por defecto si no los tiene
          // Si se desactiva, limpiar horarios
          start_time: newIsAvailable ? (day.start_time || "09:00") : null,
          end_time: newIsAvailable ? (day.end_time || "18:00") : null,
        };
      }
      return day;
    }));
  };

  const handleTimeChange = (dayIndex: number, field: 'start_time' | 'end_time', value: string) => {
    if (readonly) return;

    setAvailability(prev => prev.map((day, index) => {
      if (index === dayIndex) {
        return {
          ...day,
          [field]: value || null,
        };
      }
      return day;
    }));
  };

  const handleSave = async () => {
    if (readonly) return;

    const token = getToken();
    if (!token) {
      toast.error("Sesión expirada. Inicia sesión nuevamente.");
      return;
    }

    // Validar que si un día está disponible, tenga horarios
    const hasInvalidDays = availability.some(day => 
      day.is_available && (!day.start_time || !day.end_time)
    );

    if (hasInvalidDays) {
      toast.error("Los días marcados como disponibles deben tener horarios de inicio y fin");
      return;
    }

    setSaving(true);
    setError(null);

    try {
      await availabilityController.update(availability, token);
      toast.success("Disponibilidad guardada correctamente");
      if (onSave) {
        onSave();
      }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : "Error al guardar disponibilidad";
      setError(errorMessage);
      toast.error(errorMessage);
    } finally {
      setSaving(false);
    }
  };

  const isCurrentlyAvailable = (day: AvailabilityDayDto): boolean => {
    if (!day.is_available || !day.start_time || !day.end_time) return false;

    try {
      const now = new Date();
      const currentDay = now.getDay(); // 0 = Domingo, 1 = Lunes, etc.
      
      // Verificar que sea el mismo día
      if (currentDay !== day.day_of_week) return false;

      // Extraer hora y minutos de los tiempos (formato HH:MM o HH:MM:SS)
      const startTime = day.start_time.substring(0, 5); // "HH:MM"
      const endTime = day.end_time.substring(0, 5); // "HH:MM"
      const currentTime = `${now.getHours().toString().padStart(2, '0')}:${now.getMinutes().toString().padStart(2, '0')}`;

      // Comparar strings de tiempo (funciona porque formato es HH:MM)
      return currentTime >= startTime && currentTime <= endTime;
    } catch {
      return false;
    }
  };

  if (loading && availability.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Calendar className="h-5 w-5" />
            Disponibilidad
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-center py-8">
            <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="flex items-center gap-2">
              <Calendar className="h-5 w-5" />
              Horarios de Disponibilidad
            </CardTitle>
            <CardDescription>
              {readonly ? "Horarios disponibles del trabajador" : "Configura tus horarios de disponibilidad semanal"}
            </CardDescription>
          </div>
          {!readonly && (
            <Button onClick={handleSave} disabled={saving} className="gap-2">
              {saving ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin" />
                  Guardando...
                </>
              ) : (
                <>
                  <CheckCircle2 className="h-4 w-4" />
                  Guardar
                </>
              )}
            </Button>
          )}
        </div>
      </CardHeader>
      <CardContent>
        {error && (
          <Alert variant="destructive" className="mb-4">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}

        <div className="space-y-4">
          {availability.map((day, index) => {
            const isAvailableNow = isCurrentlyAvailable(day);
            
            return (
              <div key={day.day_of_week} className="flex items-center gap-4 p-4 border rounded-lg">
                <div className="flex items-center gap-3 w-32">
                  {!readonly && (
                    <Checkbox
                      checked={day.is_available}
                      onCheckedChange={() => handleDayToggle(index)}
                      id={`day-${day.day_of_week}`}
                    />
                  )}
                  <Label 
                    htmlFor={`day-${day.day_of_week}`}
                    className={`font-medium cursor-pointer ${readonly && !day.is_available ? 'text-muted-foreground line-through' : ''}`}
                  >
                    {DAY_NAMES[day.day_of_week]}
                  </Label>
                </div>

                {day.is_available ? (
                  <div className="flex items-center gap-4 flex-1">
                    <div className="flex items-center gap-2 flex-1">
                      <Clock className="h-4 w-4 text-muted-foreground" />
                      <Input
                        type="time"
                        value={day.start_time || ""}
                        onChange={(e) => handleTimeChange(index, 'start_time', e.target.value)}
                        disabled={readonly}
                        className="w-32"
                      />
                      <span className="text-muted-foreground">-</span>
                      <Input
                        type="time"
                        value={day.end_time || ""}
                        onChange={(e) => handleTimeChange(index, 'end_time', e.target.value)}
                        disabled={readonly}
                        className="w-32"
                      />
                    </div>
                    {readonly && isAvailableNow && (
                      <span className="text-xs text-success font-medium flex items-center gap-1">
                        <CheckCircle2 className="h-3 w-3" />
                        Disponible ahora
                      </span>
                    )}
                  </div>
                ) : (
                  <span className="text-sm text-muted-foreground italic">No disponible</span>
                )}
              </div>
            );
          })}
        </div>
      </CardContent>
    </Card>
  );
}
