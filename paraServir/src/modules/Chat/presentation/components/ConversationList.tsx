import { useEffect, useState, useMemo } from "react";
import { Card, CardContent } from "@/shared/components/ui/card";
import { Avatar, AvatarImage, AvatarFallback } from "@/shared/components/ui/avatar";
import { Badge } from "@/shared/components/ui/badge";
import { LoadingState } from "@/shared/components/feedback/LoadingState";
import { Alert, AlertDescription } from "@/shared/components/ui/alert";
import { ChatController } from "../../infra/http/controllers/chat.controller";
import type { ConversationDto } from "../../application/dto/conversation.dto";
import { useAuth } from "@/shared/hooks/useAuth";
import { useSocket } from "@/shared/hooks/useSocket";
import { AlertCircle, MessageSquare } from "lucide-react";
import { format, formatDistanceToNow } from "date-fns";
import { es } from "date-fns/locale";
import { cn } from "@/shared/lib/utils";
import { getUserAvatar } from "@/shared/utils/avatar-utils";

interface ConversationListProps {
  selectedConversationId?: string;
  onSelectConversation: (conversation: ConversationDto) => void;
}

export function ConversationList({ selectedConversationId, onSelectConversation }: ConversationListProps) {
  const [conversations, setConversations] = useState<ConversationDto[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { getToken } = useAuth();
  const { socket, isConnected, joinConversations } = useSocket();
  const controller = useMemo(() => new ChatController(), []);

  useEffect(() => {
    const loadConversations = async () => {
      setLoading(true);
      setError(null);

      try {
        const token = getToken();
        if (!token) {
          setError("Sesión expirada. Inicia sesión nuevamente.");
          return;
        }

        const response = await controller.getConversations(token);
        const loadedConversations = response.conversations || [];
        setConversations(loadedConversations);

        // Unirse a todas las conversaciones cuando se cargan
        if (isConnected && loadedConversations.length > 0) {
          const conversationIds = loadedConversations.map(
            (c) => c.request_id || c.id
          ).filter((id): id is string => !!id);
          if (conversationIds.length > 0) {
            joinConversations(conversationIds);
          }
        }
      } catch (err) {
        const errorMessage = err instanceof Error ? err.message : "Error al cargar conversaciones";
        setError(errorMessage);
      } finally {
        setLoading(false);
      }
    };

    void loadConversations();
  }, [controller, getToken, isConnected, joinConversations]);

  // Escuchar actualizaciones de conversaciones en tiempo real
  useEffect(() => {
    if (!socket) return;

    const handleConversationUpdated = (data: { 
      request_id: string; 
      last_message: string; 
      last_message_at: string;
    }) => {
      setConversations((prev) => {
        const updated = prev.map((conv) => {
          const conversationId = conv.request_id || conv.id;
          if (conversationId === data.request_id) {
            return {
              ...conv,
              last_message: data.last_message,
              last_message_at: data.last_message_at,
              updated_at: data.last_message_at,
            };
          }
          return conv;
        });

        // Ordenar por último mensaje (más reciente primero)
        return updated.sort((a, b) => {
          const aTime = new Date(a.last_message_at || a.updated_at || 0).getTime();
          const bTime = new Date(b.last_message_at || b.updated_at || 0).getTime();
          return bTime - aTime;
        });
      });
    };

    socket.on("conversation-updated", handleConversationUpdated);

    return () => {
      socket.off("conversation-updated", handleConversationUpdated);
    };
  }, [socket]);

  const formatLastMessageTime = (dateString?: string | null) => {
    if (!dateString) return "";
    try {
      const date = new Date(dateString);
      const now = new Date();
      const diffInHours = (now.getTime() - date.getTime()) / (1000 * 60 * 60);
      
      if (diffInHours < 24) {
        return formatDistanceToNow(date, { addSuffix: true, locale: es });
      }
      return format(date, "MMM d", { locale: es });
    } catch {
      return "";
    }
  };

  if (loading) {
    return <LoadingState message="Cargando conversaciones..." variant="list" count={5} />;
  }

  if (error) {
    return (
      <Alert variant="destructive">
        <AlertCircle className="h-4 w-4" />
        <AlertDescription>{error}</AlertDescription>
      </Alert>
    );
  }

  if (conversations.length === 0) {
    return (
      <div className="text-center py-12">
        <MessageSquare className="h-12 w-12 text-muted-foreground mx-auto mb-4 opacity-50" />
        <p className="text-muted-foreground font-medium">No conversations yet</p>
        <p className="text-sm text-muted-foreground mt-2">
          Start a conversation from a service request
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-1">
      {conversations.map((conversation) => {
        const otherUser = conversation.other_user;
        const firstName = otherUser?.first_name || "";
        const lastName = otherUser?.last_name || "";
        const getInitials = () => {
          if (firstName && lastName) {
            return `${firstName[0]}${lastName[0]}`.toUpperCase();
          }
          if (firstName) return firstName[0].toUpperCase();
          if (lastName) return lastName[0].toUpperCase();
          return "?";
        };
        const initials = getInitials();
        const fullName = `${firstName} ${lastName}`.trim() || "Usuario";
        const isSelected = selectedConversationId === conversation.id || selectedConversationId === conversation.request_id;

        // Generar avatar si no existe
        const displayAvatar = getUserAvatar(
          otherUser?.id || conversation.id,
          otherUser?.avatar_url || otherUser?.avatar,
          firstName,
          lastName
        );

        return (
          <div
            key={conversation.id}
            className={cn(
              "flex items-center gap-3 p-4 rounded-lg cursor-pointer transition-all",
              "hover:bg-[#F1F3FB]",
              isSelected && "bg-[#58A3B0]/10 border border-[#58A3B0]/20"
            )}
            onClick={() => onSelectConversation(conversation)}
          >
            <Avatar className="h-12 w-12 shrink-0 border-2 border-border">
              <AvatarImage src={displayAvatar} alt={fullName} />
              <AvatarFallback className="bg-[#58A3B0] text-white text-sm font-semibold">
                {initials}
              </AvatarFallback>
            </Avatar>
            <div className="flex-1 min-w-0">
              <div className="flex items-center justify-between gap-2 mb-1">
                <h3 className="font-semibold text-sm text-foreground truncate">{fullName}</h3>
                {conversation.last_message?.created_at && (
                  <span className="text-xs text-muted-foreground whitespace-nowrap shrink-0">
                    {formatLastMessageTime(conversation.last_message.created_at)}
                  </span>
                )}
              </div>
              <p className="text-sm text-muted-foreground truncate leading-relaxed">
                {conversation.last_message?.content || "No messages yet"}
              </p>
            </div>
            {conversation.unread_count && conversation.unread_count > 0 && (
              <Badge 
                variant="destructive" 
                className="h-6 w-6 rounded-full p-0 flex items-center justify-center text-xs font-semibold shrink-0"
              >
                {conversation.unread_count > 9 ? '9+' : conversation.unread_count}
              </Badge>
            )}
          </div>
        );
      })}
    </div>
  );
}
