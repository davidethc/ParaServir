import { useEffect, useState, useMemo } from "react";
import { Card, CardContent } from "@/shared/components/ui/card";
import { Avatar, AvatarImage, AvatarFallback } from "@/shared/components/ui/avatar";
import { Badge } from "@/shared/components/ui/badge";
import { LoadingState } from "@/shared/components/feedback/LoadingState";
import { Alert, AlertDescription } from "@/shared/components/ui/alert";
import { ChatController } from "../../infra/http/controllers/chat.controller";
import type { ConversationDto } from "../../application/dto/conversation.dto";
import { useAuth } from "@/shared/hooks/useAuth";
import { AlertCircle, MessageSquare } from "lucide-react";
import { format, formatDistanceToNow } from "date-fns";
import { es } from "date-fns/locale";
import { cn } from "@/shared/lib/utils";

interface ConversationListProps {
  selectedConversationId?: string;
  onSelectConversation: (conversation: ConversationDto) => void;
}

export function ConversationList({ selectedConversationId, onSelectConversation }: ConversationListProps) {
  const [conversations, setConversations] = useState<ConversationDto[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { getToken } = useAuth();
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
        setConversations(response.conversations || []);
      } catch (err) {
        const errorMessage = err instanceof Error ? err.message : "Error al cargar conversaciones";
        setError(errorMessage);
      } finally {
        setLoading(false);
      }
    };

    void loadConversations();
  }, [controller, getToken]);

  const formatLastMessageTime = (dateString?: string | null) => {
    if (!dateString) return "";
    try {
      const date = new Date(dateString);
      const now = new Date();
      const diffInHours = (now.getTime() - date.getTime()) / (1000 * 60 * 60);
      
      if (diffInHours < 24) {
        return formatDistanceToNow(date, { addSuffix: true, locale: es });
      }
      return format(date, "dd/MM/yyyy", { locale: es });
    } catch {
      return "";
    }
  };

  if (loading) {
    return <LoadingState message="Cargando conversaciones..." variant="list" count={3} />;
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
      <Card>
        <CardContent className="py-8">
          <div className="text-center">
            <MessageSquare className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
            <p className="text-muted-foreground">Aún no tienes conversaciones</p>
            <p className="text-sm text-muted-foreground mt-2">
              Las conversaciones aparecerán cuando tengas solicitudes de servicio con trabajadores asignados
            </p>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-2">
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
        const isSelected = selectedConversationId === conversation.request_id;

        return (
          <Card
            key={conversation.id}
            className={cn(
              "cursor-pointer transition-all hover:shadow-md",
              isSelected && "ring-2 ring-primary"
            )}
            onClick={() => onSelectConversation(conversation)}
          >
            <CardContent className="p-4">
              <div className="flex items-start gap-3">
                <Avatar className="h-12 w-12">
                  <AvatarImage src={otherUser.avatar || undefined} alt={fullName} />
                  <AvatarFallback className="text-sm">{initials}</AvatarFallback>
                </Avatar>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between gap-2 mb-1">
                    <h3 className="font-semibold text-sm truncate">{fullName}</h3>
                    {conversation.unread_count > 0 && (
                      <Badge variant="default" className="text-xs">
                        {conversation.unread_count}
                      </Badge>
                    )}
                  </div>
                  {conversation.last_message && (
                    <p className="text-sm text-muted-foreground truncate mb-1">
                      {conversation.last_message}
                    </p>
                  )}
                  <div className="flex items-center justify-between gap-2">
                    <Badge variant="outline" className="text-xs">
                      {conversation.status}
                    </Badge>
                    {conversation.last_message_at && (
                      <span className="text-xs text-muted-foreground">
                        {formatLastMessageTime(conversation.last_message_at)}
                      </span>
                    )}
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        );
      })}
    </div>
  );
}

