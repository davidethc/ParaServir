import { Card, CardContent, CardHeader } from "@/shared/components/ui/card";
import { Avatar, AvatarImage, AvatarFallback } from "@/shared/components/ui/avatar";
import { ReviewRating } from "./ReviewRating";
import { format } from "date-fns";
import { es } from "date-fns/locale";
import type { ReviewDto } from "../../application/dto/review.dto";

interface ReviewCardProps {
  review: ReviewDto;
}

export function ReviewCard({ review }: ReviewCardProps) {
  const clientName = review.client_first_name && review.client_last_name
    ? `${review.client_first_name} ${review.client_last_name}`
    : review.client_email || "Cliente";
  
  const getInitials = () => {
    if (review.client_first_name && review.client_last_name) {
      return `${review.client_first_name[0]}${review.client_last_name[0]}`.toUpperCase();
    }
    if (clientName && clientName.length > 0) {
      return clientName[0].toUpperCase();
    }
    return "C";
  };
  
  const initials = getInitials();

  const formattedDate = format(new Date(review.created_at), "dd 'de' MMMM, yyyy", { locale: es });

  return (
    <Card>
      <CardHeader>
        <div className="flex items-start gap-3">
          <Avatar className="h-10 w-10">
            <AvatarImage src={review.client_avatar || undefined} alt={clientName} />
            <AvatarFallback className="text-sm">{initials}</AvatarFallback>
          </Avatar>
          <div className="flex-1">
            <div className="flex items-center justify-between">
              <div>
                <p className="font-semibold text-sm">{clientName}</p>
                <p className="text-xs text-muted-foreground">{formattedDate}</p>
              </div>
              <ReviewRating rating={review.rating} size="sm" />
            </div>
          </div>
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

