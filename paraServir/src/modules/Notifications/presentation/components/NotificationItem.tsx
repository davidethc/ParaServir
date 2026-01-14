import { useNotifications } from "@/shared/hooks/useNotifications";
import { formatDistanceToNow } from "date-fns";
import { es } from "date-fns/locale";
import type { NotificationDto } from "@/modules/Notifications/application/dto/notification.dto";
import { 
  MessageSquare, 
  CheckCircle2, 
  Star, 
  AlertCircle,
  X,
  Loader2
} from "lucide-react";
import { cn } from "@/shared/lib/utils";
import { useNavigate } from "react-router-dom";
import { ROUTES } from "@/shared/constants/routes.constants";

interface NotificationItemProps {
  notification: NotificationDto;
}

const typeIcons = {
  message: MessageSquare,
  request_accepted: CheckCircle2,
  request_completed: CheckCircle2,
  request_in_progress: Loader2,
  review_received: Star,
  verification_status: AlertCircle,
};

const typeColors = {
  message: "text-blue-500",
  request_accepted: "text-green-500",
  request_completed: "text-green-500",
  request_in_progress: "text-yellow-500",
  review_received: "text-yellow-500",
  verification_status: "text-purple-500",
};

export function NotificationItem({ notification }: NotificationItemProps) {
  const { markAsRead, deleteNotification } = useNotifications();
  const navigate = useNavigate();
  
  const Icon = typeIcons[notification.type] || AlertCircle;
  const iconColor = typeColors[notification.type] || "text-muted-foreground";

  const handleClick = () => {
    if (!notification.is_read) {
      markAsRead(notification.id);
    }

    // Navegar según el tipo de notificación
    if (notification.related_id) {
      if (notification.type === 'message' || 
          notification.type === 'request_accepted' || 
          notification.type === 'request_completed' ||
          notification.type === 'request_in_progress') {
        navigate(`${ROUTES.DASHBOARD.REQUESTS}/${notification.related_id}`);
      } else if (notification.type === 'review_received') {
        // Navegar a perfil o reseñas
        navigate(ROUTES.DASHBOARD.HOME);
      }
    }
  };

  const handleDelete = (e: React.MouseEvent) => {
    e.stopPropagation();
    deleteNotification(notification.id);
  };

  const timeAgo = formatDistanceToNow(new Date(notification.created_at), {
    addSuffix: true,
    locale: es,
  });

  return (
    <div
      onClick={handleClick}
      className={cn(
        "p-3 rounded-lg cursor-pointer transition-colors bg-background hover:bg-muted/50",
        !notification.is_read && "bg-primary/10 border-l-2 border-l-primary"
      )}
    >
      <div className="flex items-start gap-3">
        <Icon className={cn("h-5 w-5 mt-0.5 flex-shrink-0", iconColor)} />
        <div className="flex-1 min-w-0">
          <div className="flex items-start justify-between gap-2">
            <div className="flex-1">
              <p className={cn(
                "text-sm font-medium",
                !notification.is_read && "font-semibold"
              )}>
                {notification.title}
              </p>
              <p className="text-xs text-muted-foreground mt-1 line-clamp-2">
                {notification.message}
              </p>
              <p className="text-xs text-muted-foreground mt-1">
                {timeAgo}
              </p>
            </div>
            <button
              onClick={handleDelete}
              className="text-muted-foreground hover:text-destructive transition-colors p-1"
            >
              <X className="h-3 w-3" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
