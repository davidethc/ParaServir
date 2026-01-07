import { useEffect, useState, useRef, useMemo } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/shared/components/ui/card";
import { Avatar, AvatarImage, AvatarFallback } from "@/shared/components/ui/avatar";
import { Badge } from "@/shared/components/ui/badge";
import { LoadingState } from "@/shared/components/feedback/LoadingState";
import { Alert, AlertDescription } from "@/shared/components/ui/alert";
import { MessageBubble } from "./MessageBubble";
import { MessageInput } from "./MessageInput";
import { ChatController } from "../../infra/http/controllers/chat.controller";
import type { ConversationDto } from "../../application/dto/conversation.dto";
import type { MessageDto } from "../../application/dto/message.dto";
import { useAuth } from "@/shared/hooks/useAuth";
import { AlertCircle, MessageSquare } from "lucide-react";

interface ChatWindowProps {
  conversation: ConversationDto | null;
  onMessageSent?: () => void;
}

export function ChatWindow({ conversation, onMessageSent }: ChatWindowProps) {
  const [messages, setMessages] = useState<MessageDto[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [sending, setSending] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const { getToken } = useAuth();
  const controller = useMemo(() => new ChatController(), []);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    if (conversation) {
      const loadMessages = async () => {
        setLoading(true);
        setError(null);

        try {
          const token = getToken();
          if (!token) {
            setError("Sesión expirada. Inicia sesión nuevamente.");
            return;
          }

          const response = await controller.getMessages(conversation.request_id, token);
          setMessages(response.messages || []);
        } catch (err) {
          const errorMessage = err instanceof Error ? err.message : "Error al cargar mensajes";
          setError(errorMessage);
        } finally {
          setLoading(false);
        }
      };

      void loadMessages();
    } else {
      setMessages([]);
      setError(null);
    }
  }, [conversation, controller, getToken]);

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const handleSendMessage = async (content: string) => {
    if (!conversation) return;

    setSending(true);
    setError(null);

    try {
      const token = getToken();
      if (!token) {
        setError("Sesión expirada. Inicia sesión nuevamente.");
        return;
      }

      const newMessage = await controller.sendMessage(conversation.request_id, { content }, token);
      setMessages((prev) => [...prev, newMessage]);
      
      if (onMessageSent) {
        onMessageSent();
      }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : "Error al enviar mensaje";
      setError(errorMessage);
      throw err;
    } finally {
      setSending(false);
    }
  };

  if (!conversation) {
    return (
      <Card className="h-full flex items-center justify-center">
        <CardContent className="py-8">
          <div className="text-center">
            <MessageSquare className="h-16 w-16 text-muted-foreground mx-auto mb-4" />
            <p className="text-muted-foreground">Selecciona una conversación para comenzar</p>
          </div>
        </CardContent>
      </Card>
    );
  }

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

  return (
    <Card className="h-full flex flex-col">
      <CardHeader className="border-b border-border">
        <div className="flex items-center gap-3">
          <Avatar className="h-10 w-10">
            <AvatarImage src={otherUser.avatar || undefined} alt={fullName} />
            <AvatarFallback>{initials}</AvatarFallback>
          </Avatar>
          <div className="flex-1">
            <CardTitle className="text-lg">{fullName}</CardTitle>
            <div className="flex items-center gap-2 mt-1">
              <Badge variant="outline" className="text-xs">
                {conversation.status}
              </Badge>
              <span className="text-xs text-muted-foreground">
                Solicitud #{conversation.request_id.slice(0, 8)}
              </span>
            </div>
          </div>
        </div>
      </CardHeader>

      <CardContent className="flex-1 flex flex-col p-0 overflow-hidden">
        {error && (
          <Alert variant="destructive" className="m-4">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}

        {loading ? (
          <div className="flex-1 flex items-center justify-center">
            <LoadingState message="Cargando mensajes..." variant="list" count={3} />
          </div>
        ) : (
          <div className="flex-1 overflow-y-auto p-4">
            {messages.length === 0 ? (
              <div className="text-center py-8">
                <MessageSquare className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                <p className="text-muted-foreground">No hay mensajes aún</p>
                <p className="text-sm text-muted-foreground mt-2">
                  Envía el primer mensaje para comenzar la conversación
                </p>
              </div>
            ) : (
              <>
                {messages.map((message) => (
                  <MessageBubble key={message.id} message={message} />
                ))}
                <div ref={messagesEndRef} />
              </>
            )}
          </div>
        )}

        <MessageInput
          onSendMessage={handleSendMessage}
          disabled={loading || sending}
          placeholder={`Escribe un mensaje a ${fullName}...`}
        />
      </CardContent>
    </Card>
  );
}

