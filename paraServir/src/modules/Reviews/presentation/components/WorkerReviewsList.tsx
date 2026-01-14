import { useEffect, useState, useMemo } from "react";
import { ReviewCard } from "./ReviewCard";
import { ReviewRating } from "./ReviewRating";
import { ReviewController } from "../../infra/http/controllers/review.controller";
import type { ReviewDto, WorkerReviewsResponse } from "../../application/dto/review.dto";
import { LoadingState } from "@/shared/components/feedback/LoadingState";
import { Alert, AlertDescription } from "@/shared/components/ui/alert";
import { AlertCircle, MessageSquare } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/shared/components/ui/card";
import { Separator } from "@/shared/components/ui/separator";

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
      <Card>
        <CardContent className="py-8">
          <div className="text-center">
            <MessageSquare className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
            <p className="text-muted-foreground">Aún no hay reseñas para este trabajador</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      {showAverage && (
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Calificación General</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center gap-4">
              <div className="text-center">
                <div className="text-4xl font-bold">{averageRating.toFixed(1)}</div>
                <ReviewRating rating={averageRating} size="lg" className="justify-center mt-2" />
              </div>
              <Separator orientation="vertical" className="h-16" />
              <div className="flex-1">
                <p className="text-sm text-muted-foreground">
                  Basado en {totalReviews} {totalReviews === 1 ? "reseña" : "reseñas"}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      <div className="space-y-4">
        <h3 className="text-lg font-semibold">
          Reseñas ({totalReviews})
        </h3>
        {reviews.map((review) => (
          <ReviewCard key={review.id} review={review} />
        ))}
      </div>
    </div>
  );
}

