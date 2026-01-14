import { useState, useEffect, useCallback, useMemo } from "react";
import { useAuth } from "./useAuth";
import { NotificationController } from "@/modules/Notifications/infra/http/controllers/notification.controller";
import type { NotificationDto } from "@/modules/Notifications/application/dto/notification.dto";

export function useNotifications(pollInterval: number = 30000) {
  const { getToken, isAuthenticated } = useAuth();
  const [notifications, setNotifications] = useState<NotificationDto[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const controller = useMemo(() => new NotificationController(), []);

  const loadNotifications = useCallback(async () => {
    if (!isAuthenticated) {
      setNotifications([]);
      setUnreadCount(0);
      return;
    }

    const token = getToken();
    if (!token) return;

    setLoading(true);
    setError(null);

    try {
      const response = await controller.getAll(token, false, 50);
      setNotifications(response.notifications || []);
      setUnreadCount(response.unread_count || 0);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : "Error al cargar notificaciones";
      setError(errorMessage);
      console.error("Error loading notifications:", err);
    } finally {
      setLoading(false);
    }
  }, [controller, getToken, isAuthenticated]);

  const markAsRead = useCallback(async (id: string) => {
    const token = getToken();
    if (!token) return;

    try {
      await controller.markAsRead(id, token);
      // Actualizar estado local
      setNotifications(prev => 
        prev.map(n => n.id === id ? { ...n, is_read: true } : n)
      );
      setUnreadCount(prev => Math.max(0, prev - 1));
    } catch (err) {
      console.error("Error marking notification as read:", err);
    }
  }, [controller, getToken]);

  const markAllAsRead = useCallback(async () => {
    const token = getToken();
    if (!token) return;

    try {
      await controller.markAllAsRead(token);
      // Actualizar estado local
      setNotifications(prev => prev.map(n => ({ ...n, is_read: true })));
      setUnreadCount(0);
    } catch (err) {
      console.error("Error marking all notifications as read:", err);
    }
  }, [controller, getToken]);

  const deleteNotification = useCallback(async (id: string) => {
    const token = getToken();
    if (!token) return;

    try {
      await controller.delete(id, token);
      // Actualizar estado local
      const deleted = notifications.find(n => n.id === id);
      setNotifications(prev => prev.filter(n => n.id !== id));
      if (deleted && !deleted.is_read) {
        setUnreadCount(prev => Math.max(0, prev - 1));
      }
    } catch (err) {
      console.error("Error deleting notification:", err);
    }
  }, [controller, getToken, notifications]);

  // Cargar notificaciones al montar y cuando cambie la autenticación
  useEffect(() => {
    loadNotifications();
  }, [loadNotifications]);

  // Polling para actualizar notificaciones periódicamente
  useEffect(() => {
    if (!isAuthenticated) return;

    const interval = setInterval(() => {
      loadNotifications();
    }, pollInterval);

    return () => clearInterval(interval);
  }, [loadNotifications, pollInterval, isAuthenticated]);

  return {
    notifications,
    unreadCount,
    loading,
    error,
    loadNotifications,
    markAsRead,
    markAllAsRead,
    deleteNotification,
  };
}
