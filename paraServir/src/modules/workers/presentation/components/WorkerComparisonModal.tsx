import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/shared/components/ui/dialog";
import { Button } from "@/shared/components/ui/button";
import { Avatar, AvatarImage, AvatarFallback } from "@/shared/components/ui/avatar";
import { Badge } from "@/shared/components/ui/badge";
import { Separator } from "@/shared/components/ui/separator";
import type { WorkerProfileDto } from "../../application/dto/worker-profile.dto";
import { ReviewRating } from "@/modules/Reviews/presentation/components/ReviewRating";
import { getWorkerAvatar } from "@/shared/utils/avatar-utils";
import { formatDistance } from "@/shared/utils/distance-utils";
import { 
  CheckCircle2, 
  MapPin, 
  DollarSign, 
  Star, 
  Briefcase,
  X
} from "lucide-react";
import { ServiceController } from "@/modules/Services/infra/http/controllers/service.controller";
import { ReviewController } from "@/modules/Reviews/infra/http/controllers/review.controller";
import { useAuth } from "@/shared/hooks/useAuth";
import { useEffect, useState, useMemo } from "react";

interface WorkerComparisonModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  workers: WorkerProfileDto[];
  ratings: Record<string, number>;
}

interface WorkerWithDetails extends WorkerProfileDto {
  minPrice?: number;
  maxPrice?: number;
  servicesCount?: number;
  averageRating?: number;
}

export function WorkerComparisonModal({
  open,
  onOpenChange,
  workers,
  ratings: initialRatings,
}: WorkerComparisonModalProps) {
  const { getToken } = useAuth();
  const [workersDetails, setWorkersDetails] = useState<WorkerWithDetails[]>([]);
  const [loading, setLoading] = useState(false);
  const [ratings, setRatings] = useState<Record<string, number>>(initialRatings);

  const serviceController = useMemo(() => new ServiceController(), []);
  const reviewController = useMemo(() => new ReviewController(), []);

  useEffect(() => {
    const loadDetails = async () => {
      if (!open || workers.length === 0) return;

      setLoading(true);
      const token = getToken();

      try {
        const details: WorkerWithDetails[] = await Promise.all(
          workers.map(async (worker) => {
            const details: WorkerWithDetails = { ...worker };

            // Cargar servicios
            try {
              const services = await serviceController.getWorkerServices(worker.id, token || "");
              const prices = services
                .filter(s => s.base_price !== null && s.base_price !== undefined)
                .map(s => parseFloat(s.base_price?.toString() || "0"));
              
              if (prices.length > 0) {
                details.minPrice = Math.min(...prices);
                details.maxPrice = Math.max(...prices);
              }
              details.servicesCount = services.length;
            } catch {
              details.servicesCount = 0;
            }

            // Cargar rating si no está en initialRatings
            if (!ratings[worker.id]) {
              try {
                const reviews = await reviewController.getWorkerReviews(worker.id);
                details.averageRating = reviews.average_rating;
                setRatings(prev => ({ ...prev, [worker.id]: reviews.average_rating }));
              } catch {
                details.averageRating = 0;
              }
            } else {
              details.averageRating = ratings[worker.id];
            }

            return details;
          })
        );

        setWorkersDetails(details);
      } catch (err) {
        console.error("Error loading worker details:", err);
      } finally {
        setLoading(false);
      }
    };

    void loadDetails();
  }, [open, workers, serviceController, reviewController, getToken, initialRatings, ratings]);

  const comparisonRows = [
    {
      label: "Nombre",
      getValue: (worker: WorkerWithDetails) => `${worker.first_name} ${worker.last_name}`,
      type: "text" as const,
    },
    {
      label: "Verificación",
      getValue: (worker: WorkerWithDetails) => worker.verification_status === "verified" ? "Verificado" : "No verificado",
      type: "badge" as const,
    },
    {
      label: "Rating",
      getValue: (worker: WorkerWithDetails) => (worker.averageRating || ratings[worker.id] || 0).toFixed(1),
      type: "rating" as const,
    },
    {
      label: "Experiencia",
      getValue: (worker: WorkerWithDetails) => worker.years_experience ? `${worker.years_experience} años` : "No especificada",
      type: "text" as const,
    },
    {
      label: "Ubicación",
      getValue: (worker: WorkerWithDetails) => worker.location || "No especificada",
      type: "text" as const,
    },
    {
      label: "Distancia",
      getValue: (worker: WorkerWithDetails) => worker.distance_km ? formatDistance(worker.distance_km) : "N/A",
      type: "text" as const,
    },
    {
      label: "Servicios",
      getValue: (worker: WorkerWithDetails) => worker.servicesCount || 0,
      type: "number" as const,
    },
    {
      label: "Precio",
      getValue: (worker: WorkerWithDetails) => {
        if (worker.minPrice !== undefined && worker.maxPrice !== undefined) {
          if (worker.minPrice === worker.maxPrice) {
            return `$${worker.minPrice.toFixed(2)}`;
          }
          return `$${worker.minPrice.toFixed(2)} - $${worker.maxPrice.toFixed(2)}`;
        }
        return "No especificado";
      },
      type: "text" as const,
    },
    {
      label: "Estado",
      getValue: (worker: WorkerWithDetails) => worker.is_active ? "Activo" : "Inactivo",
      type: "badge" as const,
    },
  ];

  if (loading && workersDetails.length === 0) {
    return (
      <Dialog open={open} onOpenChange={onOpenChange}>
        <DialogContent className="max-w-5xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Comparar Trabajadores</DialogTitle>
            <DialogDescription>
              Cargando información de los trabajadores...
            </DialogDescription>
          </DialogHeader>
        </DialogContent>
      </Dialog>
    );
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-5xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Comparar Trabajadores</DialogTitle>
          <DialogDescription>
            Compara hasta 3 trabajadores lado a lado para tomar la mejor decisión
          </DialogDescription>
        </DialogHeader>

        <div className="mt-4">
          {/* Headers de columnas */}
          <div className="grid gap-4 mb-4" style={{ gridTemplateColumns: `200px repeat(${workersDetails.length}, 1fr)` }}>
            <div className="font-semibold text-sm text-muted-foreground">Criterio</div>
            {workersDetails.map((worker) => (
              <div key={worker.id} className="text-center">
                <Avatar className="h-16 w-16 mx-auto mb-2">
                  <AvatarImage 
                    src={getWorkerAvatar(worker.id, worker.avatar_url, worker.first_name, worker.last_name)} 
                    alt={`${worker.first_name} ${worker.last_name}`} 
                  />
                  <AvatarFallback>
                    {`${worker.first_name[0]}${worker.last_name[0]}`.toUpperCase()}
                  </AvatarFallback>
                </Avatar>
                <div className="font-semibold text-sm">{worker.first_name} {worker.last_name}</div>
                {worker.verification_status === "verified" && (
                  <Badge variant="default" className="mt-1 text-xs">
                    <CheckCircle2 className="h-3 w-3 mr-1" />
                    Verificado
                  </Badge>
                )}
              </div>
            ))}
          </div>

          <Separator className="mb-4" />

          {/* Filas de comparación */}
          <div className="space-y-4">
            {comparisonRows.map((row, index) => (
              <div 
                key={row.label}
                className="grid gap-4 items-center py-2 border-b border-border/50"
                style={{ gridTemplateColumns: `200px repeat(${workersDetails.length}, 1fr)` }}
              >
                <div className="font-medium text-sm text-muted-foreground flex items-center gap-2">
                  {row.label === "Rating" && <Star className="h-4 w-4" />}
                  {row.label === "Experiencia" && <Briefcase className="h-4 w-4" />}
                  {row.label === "Ubicación" && <MapPin className="h-4 w-4" />}
                  {row.label === "Precio" && <DollarSign className="h-4 w-4" />}
                  {!["Rating", "Experiencia", "Ubicación", "Precio"].includes(row.label) && row.label}
                  {["Rating", "Experiencia", "Ubicación", "Precio"].includes(row.label) && row.label}
                </div>
                {workersDetails.map((worker) => (
                  <div key={worker.id} className="text-center text-sm">
                    {row.type === "rating" ? (
                      <div className="flex flex-col items-center gap-1">
                        <ReviewRating rating={parseFloat(row.getValue(worker))} size="sm" />
                        <span className="text-xs text-muted-foreground">{row.getValue(worker)}</span>
                      </div>
                    ) : row.type === "badge" ? (
                      <Badge 
                        variant={
                          row.getValue(worker).includes("Verificado") || row.getValue(worker).includes("Activo")
                            ? "default" 
                            : "secondary"
                        }
                        className="text-xs"
                      >
                        {row.getValue(worker)}
                      </Badge>
                    ) : (
                      <span>{row.getValue(worker)}</span>
                    )}
                  </div>
                ))}
              </div>
            ))}
          </div>
        </div>

        <div className="flex justify-end gap-2 mt-6">
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cerrar
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
