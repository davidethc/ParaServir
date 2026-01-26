import { useEffect, useState, useMemo } from "react";
import { ReviewCard } from "./ReviewCard";
import { ReviewRating } from "./ReviewRating";
import { ReviewController } from "../../infra/http/controllers/review.controller";
import type { ReviewDto, WorkerReviewsResponse } from "../../application/dto/review.dto";
import { LoadingState } from "@/shared/components/feedback/LoadingState";
import { Alert, AlertDescription } from "@/shared/components/ui/alert";
import { AlertCircle, Star } from "lucide-react";
import { Card, CardContent } from "@/shared/components/ui/card";

interface WorkerReviewsListProps {
  workerId: string;
  showAverage?: boolean;
}

export function WorkerReviewsList({ workerId, showAverage = true }: WorkerReviewsListProps) {
  const [reviews, setReviews] = useState<ReviewDto[]>([]);
  const [averageRating, setAverageRating] = useState<number>(0);
  const [totalReviews, setTotalReviews] = useState<number>(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const controller = useMemo(() => new ReviewController(), []);

  useEffect(() => {
    const loadReviews = async () => {
      if (!workerId) {
        setLoading(false);
        return;
      }

      setLoading(true);
      setError(null);

      try {
        const response: WorkerReviewsResponse = await controller.getWorkerReviews(workerId);
        setReviews(response.reviews || []);
        setAverageRating(response.average_rating || 0);
        setTotalReviews(response.total_reviews || 0);
      } catch (err) {
        const errorMessage = err instanceof Error ? err.message : "Error al cargar las reseñas";
        setError(errorMessage);
      } finally {
        setLoading(false);
      }
    };

    void loadReviews();
  }, [workerId, controller]);

  if (loading) {
    return <LoadingState message="Cargando reseñas..." variant="list" count={3} />;
  }

  if (error) {
    return (
      <Alert variant="destructive">
        <AlertCircle className="h-4 w-4" />
        <AlertDescription>{error}</AlertDescription>
      </Alert>
    );
  }

  if (totalReviews === 0) {
    return (
      <Card className="border border-border rounded-xl">
        <CardContent className="py-16">
          <div className="text-center">
            <Star className="h-16 w-16 text-muted-foreground mx-auto mb-4 opacity-30" />
            <p className="text-muted-foreground font-semibold text-lg mb-2">Aún no tienes reseñas</p>
            <p className="text-sm text-muted-foreground">
              Las reseñas que recibas de tus clientes aparecerán aquí
            </p>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      {showAverage && (
        <Card className="border border-border rounded-xl shadow-sm bg-gradient-to-br from-white to-[#F9FAFE] overflow-hidden">
          <CardContent className="p-8">
            <div className="flex items-center gap-8">
              {/* Rating grande y destacado */}
              <div className="text-center">
                <div className="text-6xl font-bold text-foreground mb-3">{averageRating.toFixed(1)}</div>
                <div className="mb-2">
                  <ReviewRating rating={averageRating} size="lg" className="justify-center" />
                </div>
                <p className="text-sm font-medium text-muted-foreground mt-2">
                  {totalReviews} {totalReviews === 1 ? "reseña" : "reseñas"}
                </p>
              </div>
              
              {/* Distribución de estrellas (como Google) */}
              <div className="flex-1 space-y-2">
                <p className="text-sm font-semibold text-foreground mb-3">Distribución de calificaciones</p>
                {[5, 4, 3, 2, 1].map((star) => {
                  const count = reviews.filter(r => Math.round(r.rating) === star).length;
                  const percentage = totalReviews > 0 ? (count / totalReviews) * 100 : 0;
                  return (
                    <div key={star} className="flex items-center gap-3">
                      <div className="flex items-center gap-1 w-20">
                        <span className="text-sm text-muted-foreground">{star}</span>
                        <Star className="h-4 w-4 text-[#F4B840] fill-[#F4B840]" />
                      </div>
                      <div className="flex-1 h-2 bg-muted rounded-full overflow-hidden">
                        <div 
                          className="h-full bg-[#F4B840] rounded-full transition-all"
                          style={{ width: `${percentage}%` }}
                        />
                      </div>
                      <span className="text-sm text-muted-foreground w-12 text-right">{count}</span>
                    </div>
                  );
                })}
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="text-xl font-semibold text-foreground">
            Todas las reseñas ({totalReviews})
          </h3>
        </div>
        <div className="space-y-4">
          {reviews.map((review) => (
            <ReviewCard key={review.id} review={review} />
          ))}
        </div>
      </div>
    </div>
  );
}
