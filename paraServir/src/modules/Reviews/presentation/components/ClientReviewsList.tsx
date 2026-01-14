import { useEffect, useState, useMemo } from "react";
import { ReviewCard } from "./ReviewCard";
import { ReviewRating } from "./ReviewRating";
import { ReviewController } from "../../infra/http/controllers/review.controller";
import type { ClientReviewDto, ClientReviewsResponse } from "../../application/dto/review.dto";
import { LoadingState } from "@/shared/components/feedback/LoadingState";
import { Alert, AlertDescription } from "@/shared/components/ui/alert";
import { AlertCircle, MessageSquare, User } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/shared/components/ui/card";
import { Separator } from "@/shared/components/ui/separator";
import { Badge } from "@/shared/components/ui/badge";
import { useAuth } from "@/shared/hooks/useAuth";
import { format } from "date-fns";
import { es } from "date-fns/locale";
import { Avatar, AvatarFallback, AvatarImage } from "@/shared/components/ui/avatar";
import { getWorkerAvatar } from "@/shared/utils/avatar-utils";

interface ClientReviewsListProps {
  showAverage?: boolean;
}

export function ClientReviewsList({ showAverage = true }: ClientReviewsListProps) {
  const [reviews, setReviews] = useState<ClientReviewDto[]>([]);
  const [averageRating, setAverageRating] = useState<number>(0);
  const [totalReviews, setTotalReviews] = useState<number>(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { getToken } = useAuth();

  const controller = useMemo(() => new ReviewController(), []);

  useEffect(() => {
    const loadReviews = async () => {
      setLoading(true);
      setError(null);

      try {
        const token = getToken();
        if (!token) {
          setError("Sesión expirada. Inicia sesión nuevamente.");
          return;
        }

        const response: ClientReviewsResponse = await controller.getClientReviews(token);
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
  }, [controller, getToken]);

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
            <p className="text-muted-foreground">Aún no has creado ninguna reseña</p>
            <p className="text-sm text-muted-foreground mt-2">
              Las reseñas aparecerán aquí después de completar un servicio
            </p>
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
            <CardTitle className="text-lg">Tus Reseñas</CardTitle>
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
                  Has creado {totalReviews} {totalReviews === 1 ? "reseña" : "reseñas"}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      <div className="space-y-4">
        <h3 className="text-lg font-semibold">
          Reseñas Creadas ({totalReviews})
        </h3>
        {reviews.map((review) => (
          <ClientReviewCard key={review.id} review={review} />
        ))}
      </div>
    </div>
  );
}

interface ClientReviewCardProps {
  review: ClientReviewDto;
}

function ClientReviewCard({ review }: ClientReviewCardProps) {
  const workerName = review.worker_first_name && review.worker_last_name
    ? `${review.worker_first_name} ${review.worker_last_name}`
    : review.worker_email || "Trabajador";
  
  const initials = review.worker_first_name && review.worker_last_name
    ? `${review.worker_first_name[0]}${review.worker_last_name[0]}`.toUpperCase()
    : workerName[0]?.toUpperCase() || "T";

  const formattedDate = format(new Date(review.created_at), "dd 'de' MMMM, yyyy", { locale: es });

  // Generar avatar si no existe
  const displayAvatar = getWorkerAvatar(
    review.worker_id || '',
    review.worker_avatar,
    review.worker_first_name,
    review.worker_last_name
  );

  return (
    <Card>
      <CardHeader>
        <div className="flex items-start justify-between gap-3">
          <div className="flex items-start gap-3 flex-1">
            <Avatar className="h-10 w-10">
              <AvatarImage src={displayAvatar} alt={workerName} />
              <AvatarFallback className="text-sm">{initials}</AvatarFallback>
            </Avatar>
            <div className="flex-1">
              <div className="flex items-center gap-2 mb-1">
                <p className="font-semibold text-sm">{workerName}</p>
                <Badge variant="outline" className="text-xs">
                  {review.category_name || "Servicio"}
                </Badge>
              </div>
              <p className="text-xs text-muted-foreground">{formattedDate}</p>
              {review.service_title && (
                <p className="text-sm text-muted-foreground mt-1">{review.service_title}</p>
              )}
            </div>
          </div>
          <ReviewRating rating={review.rating} size="sm" />
        </div>
      </CardHeader>
      {review.comment && (
        <CardContent>
          <p className="text-sm text-foreground leading-relaxed">{review.comment}</p>
        </CardContent>
      )}
    </Card>
  );
}

