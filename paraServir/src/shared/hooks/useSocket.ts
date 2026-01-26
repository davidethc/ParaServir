import { useEffect, useRef, useState, useCallback } from "react";
import { io, type Socket } from "socket.io-client";
import { useAuth } from "./useAuth";

const SOCKET_URL = import.meta.env.VITE_API_URL || "http://localhost:3900";

interface UseSocketReturn {
  socket: Socket | null;
  isConnected: boolean;
  joinConversation: (conversationId: string) => void;
  leaveConversation: (conversationId: string) => void;
  joinConversations: (conversationIds: string[]) => void;
}

/**
 * Hook para manejar conexión Socket.io en tiempo real
 */
export function useSocket(): UseSocketReturn {
  const { getToken } = useAuth();
  const [socket, setSocket] = useState<Socket | null>(null);
  const [isConnected, setIsConnected] = useState(false);
  const socketRef = useRef<Socket | null>(null);

  useEffect(() => {
    const token = getToken();
    
    if (!token) {
      // Si no hay token, no crear conexión
      return;
    }

    // Crear conexión Socket.io
    const newSocket = io(SOCKET_URL, {
      auth: {
        token: token,
      },
      transports: ["websocket", "polling"],
      reconnection: true,
      reconnectionDelay: 1000,
      reconnectionAttempts: 5,
    });

    socketRef.current = newSocket;

    // Eventos de conexión
    newSocket.on("connect", () => {
      console.log("Socket.io conectado");
      setIsConnected(true);
    });

    newSocket.on("disconnect", () => {
      console.log("Socket.io desconectado");
      setIsConnected(false);
    });

    newSocket.on("connect_error", (error) => {
      console.error("Error de conexión Socket.io:", error);
      setIsConnected(false);
    });

    setSocket(newSocket);

    // Cleanup al desmontar
    return () => {
      if (socketRef.current) {
        socketRef.current.disconnect();
        socketRef.current = null;
        setSocket(null);
        setIsConnected(false);
      }
    };
  }, [getToken]);

  const joinConversation = useCallback((conversationId: string) => {
    if (socketRef.current && isConnected) {
      socketRef.current.emit("join-conversation", conversationId);
    }
  }, [isConnected]);

  const leaveConversation = useCallback((conversationId: string) => {
    if (socketRef.current && isConnected) {
      socketRef.current.emit("leave-conversation", conversationId);
    }
  }, [isConnected]);

  const joinConversations = useCallback((conversationIds: string[]) => {
    if (socketRef.current && isConnected) {
      socketRef.current.emit("join-conversations", conversationIds);
    }
  }, [isConnected]);

  return {
    socket,
    isConnected,
    joinConversation,
    leaveConversation,
    joinConversations,
  };
}
