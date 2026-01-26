import { useNotifications } from "@/shared/hooks/useNotifications";
import { NotificationItem } from "./NotificationItem";
import { Button } from "@/shared/components/ui/button";
import { ScrollArea } from "@/shared/components/ui/scroll-area";
import { Separator } from "@/shared/components/ui/separator";
import { LoadingState } from "@/shared/components/feedback/LoadingState";
import { Alert, AlertDescription } from "@/shared/components/ui/alert";
import { BellOff, CheckCheck } from "lucide-react";

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
      <div className="p-6">
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
    <div className="w-full bg-white">
      {/* Header */}
      <div className="px-6 py-4 border-b border-border flex items-center justify-between bg-white">
        <h3 className="text-lg font-semibold text-foreground">Notificaciones</h3>
        {unreadCount > 0 && (
          <Button
            variant="ghost"
            size="sm"
            onClick={markAllAsRead}
            className="h-8 text-xs text-muted-foreground hover:text-foreground hover:bg-[#F1F3FB] gap-1.5"
          >
            <CheckCheck className="h-3.5 w-3.5" />
            Marcar todas como leídas
          </Button>
        )}
      </div>

      {/* Notifications List */}
      <ScrollArea className="max-h-[calc(100vh-300px)] bg-white">
        <div className="p-2 bg-white">
          {notifications.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-12 text-center">
              <BellOff className="h-12 w-12 text-muted-foreground mb-3 opacity-50" />
              <p className="text-sm text-muted-foreground font-medium">No hay notificaciones</p>
              <p className="text-xs text-muted-foreground mt-1">Las notificaciones aparecerán aquí</p>
            </div>
          ) : (
            <>
              {unreadNotifications.map((notification) => (
                <NotificationItem key={notification.id} notification={notification} />
              ))}
              {unreadNotifications.length > 0 && readNotifications.length > 0 && (
                <Separator className="my-1" />
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
