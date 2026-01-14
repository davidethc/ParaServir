import { useNotifications } from "@/shared/hooks/useNotifications";
import { NotificationItem } from "./NotificationItem";
import { Button } from "@/shared/components/ui/button";
import { ScrollArea } from "@/shared/components/ui/scroll-area";
import { Separator } from "@/shared/components/ui/separator";
import { LoadingState } from "@/shared/components/feedback/LoadingState";
import { Alert, AlertDescription } from "@/shared/components/ui/alert";
import { BellOff, CheckCheck } from "lucide-react";
import { formatDistanceToNow } from "date-fns";
import { es } from "date-fns/locale";

export function NotificationList() {
  const { 
    notifications, 
    unreadCount, 
    loading, 
    error,
    markAllAsRead 
  } = useNotifications();

  if (loading) {
    return (
      <div className="p-4">
        <LoadingState message="Cargando notificaciones..." variant="list" count={3} />
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-4">
        <Alert variant="destructive">
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      </div>
    );
  }

  const unreadNotifications = notifications.filter(n => !n.is_read);
  const readNotifications = notifications.filter(n => n.is_read);

  return (
    <div className="w-full bg-background">
      <div className="p-4 border-b bg-background flex items-center justify-between">
        <h3 className="font-semibold text-foreground">Notificaciones</h3>
        {unreadCount > 0 && (
          <Button
            variant="ghost"
            size="sm"
            onClick={markAllAsRead}
            className="h-7 text-xs"
          >
            <CheckCheck className="h-3 w-3 mr-1" />
            Marcar todas como leídas
          </Button>
        )}
      </div>

      <ScrollArea className="h-[400px] bg-background">
        <div className="p-2 bg-background">
          {notifications.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-8 text-center">
              <BellOff className="h-12 w-12 text-muted-foreground mb-2" />
              <p className="text-sm text-muted-foreground">No hay notificaciones</p>
            </div>
          ) : (
            <>
              {unreadNotifications.length > 0 && (
                <>
                  {unreadNotifications.map((notification) => (
                    <NotificationItem key={notification.id} notification={notification} />
                  ))}
                  {readNotifications.length > 0 && <Separator className="my-2" />}
                </>
              )}
              {readNotifications.map((notification) => (
                <NotificationItem key={notification.id} notification={notification} />
              ))}
            </>
          )}
        </div>
      </ScrollArea>
    </div>
  );
}
