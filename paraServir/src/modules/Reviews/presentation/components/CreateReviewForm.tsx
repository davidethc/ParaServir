import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/shared/components/ui/dialog";
import { Button } from "@/shared/components/ui/button";
import { Textarea } from "@/shared/components/ui/textarea";
import { Label } from "@/shared/components/ui/label";
import { ReviewRating } from "./ReviewRating";
import { Star } from "lucide-react";
import { ReviewController } from "../../infra/http/controllers/review.controller";
import type { CreateReviewDto } from "../../application/dto/create-review.dto";
import { useAuth } from "@/shared/hooks/useAuth";
import { Alert, AlertDescription } from "@/shared/components/ui/alert";
import { AlertCircle, Loader2 } from "lucide-react";

const reviewSchema = z.object({
  rating: z.number().min(1).max(5),
  comment: z.string().optional(),
});

interface CreateReviewFormProps {
  requestId: string;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSuccess?: () => void;
}

export function CreateReviewForm({ 
  requestId, 
  open, 
  onOpenChange,
  onSuccess 
}: CreateReviewFormProps) {
  const [selectedRating, setSelectedRating] = useState<number>(0);
  const [hoveredRating, setHoveredRating] = useState<number>(0);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { getToken } = useAuth();
  const controller = new ReviewController();

  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
    setValue,
    watch,
  } = useForm<CreateReviewDto>({
    resolver: zodResolver(reviewSchema),
    defaultValues: {
      rating: 0,
      comment: "",
    },
  });

  const comment = watch("comment");

  const handleRatingClick = (rating: number) => {
    setSelectedRating(rating);
    setValue("rating", rating, { shouldValidate: true });
  };

  const onSubmit = async (data: CreateReviewDto) => {
    if (selectedRating === 0) {
      setError("Por favor selecciona una calificación");
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const token = getToken();
      if (!token) {
        setError("No hay sesión activa. Por favor inicia sesión.");
        return;
      }

      const dto: CreateReviewDto = {
        request_id: requestId,
        rating: selectedRating,
        comment: data.comment || null,
      };

      await controller.create(dto, token);
      
      // Resetear formulario
      reset();
      setSelectedRating(0);
      setHoveredRating(0);
      
      // Cerrar dialog y ejecutar callback
      onOpenChange(false);
      if (onSuccess) {
        onSuccess();
      }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : "Error al crear la reseña";
      setError(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  const handleClose = () => {
    if (!loading) {
      reset();
      setSelectedRating(0);
      setHoveredRating(0);
      setError(null);
      onOpenChange(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>Calificar Servicio</DialogTitle>
          <DialogDescription>
            Comparte tu experiencia con este servicio. Tu opinión ayuda a otros usuarios.
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
          {error && (
            <Alert variant="destructive">
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}

          {/* Selección de rating */}
          <div className="space-y-2">
            <Label>Calificación *</Label>
            <div className="flex items-center gap-2">
              {[1, 2, 3, 4, 5].map((rating) => (
                <button
                  key={rating}
                  type="button"
                  onClick={() => handleRatingClick(rating)}
                  onMouseEnter={() => setHoveredRating(rating)}
                  onMouseLeave={() => setHoveredRating(0)}
                  className="transition-transform hover:scale-110 focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2 rounded"
                  disabled={loading}
                >
                  <Star
                    className={`h-8 w-8 ${
                      rating <= (hoveredRating || selectedRating)
                        ? "fill-yellow-400 text-yellow-400"
                        : "text-gray-300"
                    } transition-colors`}
                  />
                </button>
              ))}
              {selectedRating > 0 && (
                <span className="text-sm text-muted-foreground ml-2">
                  {selectedRating} {selectedRating === 1 ? "estrella" : "estrellas"}
                </span>
              )}
            </div>
            {errors.rating && (
              <p className="text-sm text-destructive">{errors.rating.message}</p>
            )}
            <input type="hidden" {...register("rating")} />
          </div>

          {/* Comentario */}
          <div className="space-y-2">
            <Label htmlFor="comment">Comentario (opcional)</Label>
            <Textarea
              id="comment"
              {...register("comment")}
              placeholder="Describe tu experiencia con el servicio..."
              rows={4}
              disabled={loading}
              className="resize-none"
            />
            {errors.comment && (
              <p className="text-sm text-destructive">{errors.comment.message}</p>
            )}
          </div>

          {/* Botones */}
          <div className="flex justify-end gap-3">
            <Button
              type="button"
              variant="outline"
              onClick={handleClose}
              disabled={loading}
            >
              Cancelar
            </Button>
            <Button type="submit" disabled={loading || selectedRating === 0}>
              {loading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Enviando...
                </>
              ) : (
                "Enviar Reseña"
              )}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}

