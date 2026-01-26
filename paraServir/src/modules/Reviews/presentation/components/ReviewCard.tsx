import { Card, CardContent } from "@/shared/components/ui/card";
import { Avatar, AvatarImage, AvatarFallback } from "@/shared/components/ui/avatar";
import { ReviewRating } from "./ReviewRating";
import { format } from "date-fns";
import { es } from "date-fns/locale";
import type { ReviewDto } from "../../application/dto/review.dto";
import { getUserAvatar } from "@/shared/utils/avatar-utils";
import { Star } from "lucide-react";

interface ReviewCardProps {
  review: ReviewDto;
}

export function ReviewCard({ review }: ReviewCardProps) {
  const clientName = review.client_first_name && review.client_last_name
    ? `${review.client_first_name} ${review.client_last_name}`
    : review.client_email || "Client";
  
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

  const formattedDate = format(new Date(review.created_at), "d 'de' MMMM, yyyy", { locale: es });

  // Generar avatar si no existe
  const displayAvatar = getUserAvatar(
    review.client_id || '',
    review.client_avatar,
    clientName
  );

  return (
    <Card className="border border-border rounded-xl shadow-sm hover:shadow-md transition-shadow">
      <CardContent className="p-6">
        <div className="flex items-start gap-4">
          {/* Avatar */}
          <Avatar className="h-12 w-12 shrink-0 border-2 border-border">
            <AvatarImage src={displayAvatar} alt={clientName} />
            <AvatarFallback className="bg-[#58A3B0] text-white text-sm font-semibold">
              {initials}
            </AvatarFallback>
          </Avatar>

          {/* Content */}
          <div className="flex-1 min-w-0">
            {/* Header: Name and Date */}
            <div className="flex items-center justify-between gap-4 mb-2">
              <h3 className="font-semibold text-base text-foreground">{clientName}</h3>
              <span className="text-xs text-muted-foreground whitespace-nowrap shrink-0">
                {formattedDate}
              </span>
            </div>

            {/* Rating */}
            <div className="flex items-center gap-2 mb-3">
              <ReviewRating rating={review.rating} size="sm" showValue={false} />
            </div>

            {/* Comment */}
            {review.comment ? (
              <p className="text-sm text-foreground leading-relaxed whitespace-pre-wrap break-words">
                {review.comment}
              </p>
            ) : (
              <p className="text-sm text-muted-foreground italic">Sin comentario</p>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
