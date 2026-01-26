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
  Loader2,
  RotateCw,
  Briefcase
} from "lucide-react";
import { cn } from "@/shared/lib/utils";
import { useNavigate } from "react-router-dom";
import { ROUTES } from "@/shared/constants/routes.constants";
import { Badge } from "@/shared/components/ui/badge";

interface NotificationItemProps {
  notification: NotificationDto;
}

const typeIcons = {
  message: MessageSquare,
  request_accepted: CheckCircle2,
  request_completed: CheckCircle2,
  request_in_progress: RotateCw,
  request_assigned: Briefcase,
  review_received: Star,
  verification_status: AlertCircle,
};

const typeColors = {
  message: "bg-blue-500 text-white",
  request_accepted: "bg-green-500 text-white",
  request_completed: "bg-green-500 text-white",
  request_in_progress: "bg-orange-500 text-white",
  request_assigned: "bg-indigo-500 text-white",
  review_received: "bg-yellow-500 text-white",
  verification_status: "bg-purple-500 text-white",
};

export function NotificationItem({ notification }: NotificationItemProps) {
  const { markAsRead, deleteNotification } = useNotifications();
  const navigate = useNavigate();
  
  const Icon = typeIcons[notification.type] || AlertCircle;
  const iconBgColor = typeColors[notification.type] || "bg-gray-500 text-white";

  const handleClick = () => {
    if (!notification.is_read) {
      markAsRead(notification.id);
    }

    // Navegar según el tipo de notificación
    if (notification.related_id) {
      if (notification.type === 'message') {
        navigate(`${ROUTES.DASHBOARD.CHATS}?conversation=${notification.related_id}`);
      } else if (
        notification.type === 'request_accepted' || 
        notification.type === 'request_completed' ||
        notification.type === 'request_in_progress' ||
        notification.type === 'request_assigned'
      ) {
        navigate(`${ROUTES.DASHBOARD.REQUESTS}/${notification.related_id}`);
      } else if (notification.type === 'review_received') {
        navigate(ROUTES.DASHBOARD.REVIEWS);
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
        "px-4 py-3 rounded-lg cursor-pointer transition-colors group relative",
        "hover:bg-[#F1F3FB] border-l-2",
        !notification.is_read 
          ? "bg-blue-50/50 border-l-[#58A3B0] hover:bg-blue-50" 
          : "border-l-transparent bg-white"
      )}
    >
      <div className="flex items-start gap-3">
        {/* Icon */}
        <div className={cn(
          "h-9 w-9 rounded-full flex items-center justify-center shrink-0",
          iconBgColor
        )}>
          <Icon className="h-4 w-4" />
        </div>

        {/* Content */}
        <div className="flex-1 min-w-0">
          <div className="flex items-start justify-between gap-2 mb-1">
            <div className="flex-1 min-w-0">
              <p className={cn(
                "text-sm leading-relaxed",
                !notification.is_read ? "font-semibold text-foreground" : "text-foreground"
              )}>
                {notification.message}
              </p>
              <p className="text-xs text-muted-foreground mt-1">
                {timeAgo}
              </p>
            </div>
            <div className="flex items-center gap-2 shrink-0">
              {/* Badge "New" */}
              {!notification.is_read && (
                <Badge 
                  variant="default" 
                  className="bg-[#58A3B0] text-white text-xs px-2 py-0.5 h-5 font-normal"
                >
                  New
                </Badge>
              )}
              {/* Delete button */}
              <button
                onClick={handleDelete}
                className="opacity-0 group-hover:opacity-100 text-muted-foreground hover:text-destructive transition-all p-1 rounded hover:bg-red-50"
                aria-label="Eliminar notificación"
              >
                <X className="h-4 w-4" />
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
