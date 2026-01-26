import { useEffect, useState, useMemo } from "react";
import { ReviewRating } from "./ReviewRating";
import { ReviewController } from "../../infra/http/controllers/review.controller";
import type { ClientReviewDto, ClientReviewsResponse } from "../../application/dto/review.dto";
import { LoadingState } from "@/shared/components/feedback/LoadingState";
import { Alert, AlertDescription } from "@/shared/components/ui/alert";
import { AlertCircle, MessageSquare } from "lucide-react";
import { Card, CardContent } from "@/shared/components/ui/card";
import { Badge } from "@/shared/components/ui/badge";
import { useAuth } from "@/shared/hooks/useAuth";
import { format } from "date-fns";
import { enUS } from "date-fns/locale";
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
    return <LoadingState message="Loading reviews..." variant="list" count={3} />;
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
        <CardContent className="py-12">
          <div className="text-center">
            <MessageSquare className="h-12 w-12 text-muted-foreground mx-auto mb-4 opacity-50" />
            <p className="text-muted-foreground font-medium">No reviews yet</p>
            <p className="text-sm text-muted-foreground mt-2">
              Your reviews will appear here after you complete a service
            </p>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      {showAverage && (
        <Card className="border border-border rounded-xl shadow-sm bg-white">
          <CardContent className="p-6">
            <div className="flex items-center gap-6">
              <div className="text-center">
                <div className="text-5xl font-bold text-foreground mb-2">{averageRating.toFixed(1)}</div>
                <ReviewRating rating={averageRating} size="lg" className="justify-center" />
              </div>
              <div className="flex-1">
                <p className="text-sm text-muted-foreground">
                  Based on {totalReviews} {totalReviews === 1 ? "review" : "reviews"}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      <div className="space-y-4">
        <h3 className="text-xl font-semibold text-foreground">
          All Reviews ({totalReviews})
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
    : review.worker_email || "Worker";
  
  const initials = review.worker_first_name && review.worker_last_name
    ? `${review.worker_first_name[0]}${review.worker_last_name[0]}`.toUpperCase()
    : workerName[0]?.toUpperCase() || "W";

  const formattedDate = format(new Date(review.created_at), "MMM d, yyyy", { locale: enUS });

  // Generar avatar si no existe
  const displayAvatar = getWorkerAvatar(
    review.worker_id || '',
    review.worker_avatar,
    review.worker_first_name,
    review.worker_last_name
  );

  return (
    <Card className="border border-border rounded-xl shadow-sm hover:shadow-md transition-shadow">
      <CardContent className="p-6">
        <div className="flex items-start gap-4">
          {/* Avatar */}
          <Avatar className="h-12 w-12 shrink-0 border-2 border-border">
            <AvatarImage src={displayAvatar} alt={workerName} />
            <AvatarFallback className="bg-[#58A3B0] text-white text-sm font-semibold">
              {initials}
            </AvatarFallback>
          </Avatar>

          {/* Content */}
          <div className="flex-1 min-w-0">
            {/* Header: Name, Badge, Date, and Rating */}
            <div className="flex items-start justify-between gap-4 mb-2">
              <div className="flex-1">
                <div className="flex items-center gap-2 mb-1">
                  <h3 className="font-semibold text-base text-foreground">{workerName}</h3>
                  {review.category_name && (
                    <Badge variant="outline" className="text-xs font-normal">
                      {review.category_name}
                    </Badge>
                  )}
                </div>
                {review.service_title && (
                  <p className="text-sm text-muted-foreground mb-2">{review.service_title}</p>
                )}
                <p className="text-xs text-muted-foreground">{formattedDate}</p>
              </div>
              <ReviewRating rating={review.rating} size="sm" showValue={false} />
            </div>

            {/* Comment */}
            {review.comment ? (
              <p className="text-sm text-foreground leading-relaxed whitespace-pre-wrap break-words mt-3">
                {review.comment}
              </p>
            ) : (
              <p className="text-sm text-muted-foreground italic mt-3">No comment provided</p>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
