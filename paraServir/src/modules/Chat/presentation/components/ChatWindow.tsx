import { useEffect, useState, useRef, useMemo } from "react";
import { Avatar, AvatarImage, AvatarFallback } from "@/shared/components/ui/avatar";
import { Badge } from "@/shared/components/ui/badge";
import { Button } from "@/shared/components/ui/button";
import { LoadingState } from "@/shared/components/feedback/LoadingState";
import { Alert, AlertDescription } from "@/shared/components/ui/alert";
import { MessageBubble } from "./MessageBubble";
import { MessageInput } from "./MessageInput";
import { ChatController } from "../../infra/http/controllers/chat.controller";
import type { ConversationDto } from "../../application/dto/conversation.dto";
import type { MessageDto } from "../../application/dto/message.dto";
import { useAuth } from "@/shared/hooks/useAuth";
import { useSocket } from "@/shared/hooks/useSocket";
import { AlertCircle, MessageSquare, Search, MoreVertical, Phone, Video } from "lucide-react";
import { getUserAvatar } from "@/shared/utils/avatar-utils";
import { cn } from "@/shared/lib/utils";

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
  const { socket, isConnected, joinConversation, leaveConversation } = useSocket();
  const controller = useMemo(() => new ChatController(), []);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  // Unirse/salir de conversación cuando cambia
  useEffect(() => {
    if (conversation && isConnected) {
      const conversationId = conversation.request_id || conversation.id;
      if (conversationId) {
        joinConversation(conversationId);
      }

      return () => {
        if (conversationId) {
          leaveConversation(conversationId);
        }
      };
    }
  }, [conversation, isConnected, joinConversation, leaveConversation]);

  // Escuchar mensajes nuevos en tiempo real
  useEffect(() => {
    if (!socket || !conversation) return;

    const handleNewMessage = (message: MessageDto) => {
      // Solo agregar el mensaje si es de esta conversación
      const conversationId = conversation.request_id || conversation.id;
      if (message.request_id === conversationId || message.request_id === conversationId) {
        setMessages((prev) => {
          // Evitar duplicados
          const exists = prev.some((m) => m.id === message.id);
          if (exists) return prev;
          return [...prev, message];
        });
      }
    };

    socket.on("new-message", handleNewMessage);

    return () => {
      socket.off("new-message", handleNewMessage);
    };
  }, [socket, conversation]);

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
      <div className="h-full flex items-center justify-center bg-[#F9FAFE]">
        <div className="text-center">
          <MessageSquare className="h-16 w-16 text-muted-foreground mx-auto mb-4 opacity-50" />
          <p className="text-muted-foreground font-medium">Select a conversation</p>
          <p className="text-sm text-muted-foreground mt-2">
            Choose a conversation from the list to start chatting
          </p>
        </div>
      </div>
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

  // Generar avatar si no existe
  const displayAvatar = getUserAvatar(
    otherUser?.id || conversation.id,
    otherUser?.avatar_url || otherUser?.avatar,
    firstName,
    lastName
  );

  // Check online status (mock for now)
  const isOnline = (otherUser as any)?.isOnline ?? false;

  return (
    <div className="h-full flex flex-col bg-[#F9FAFE]">
      {/* Header */}
      <div className="bg-white border-b border-border px-6 py-4 sticky top-0 z-10 shadow-sm">
        <div className="flex items-center justify-between gap-4">
          {/* Left: User info */}
          <div className="flex items-center gap-4 flex-1 min-w-0">
            <div className="relative shrink-0">
              <Avatar className="h-12 w-12 border-2 border-border">
                <AvatarImage src={displayAvatar} alt={fullName} />
                <AvatarFallback className="bg-[#58A3B0] text-white font-semibold">
                  {initials}
                </AvatarFallback>
              </Avatar>
              {isOnline && (
                <div className="absolute bottom-0 right-0 w-3.5 h-3.5 bg-[#2FB8A8] rounded-full border-2 border-white" />
              )}
            </div>
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 mb-1">
                <h2 className="text-lg font-semibold text-foreground truncate">{fullName}</h2>
                {isOnline && (
                  <Badge className="bg-[#2FB8A8] text-white text-xs font-medium px-2 py-0.5">
                    Online
                  </Badge>
                )}
              </div>
              <p className="text-xs text-muted-foreground truncate">
                Request #{conversation.request_id?.slice(0, 8) || conversation.id?.slice(0, 8)}
              </p>
            </div>
          </div>

          {/* Right: Actions */}
          <div className="flex items-center gap-2 shrink-0">
            <Button variant="ghost" size="icon" className="h-9 w-9 rounded-lg">
              <Phone className="h-4 w-4 text-muted-foreground" />
            </Button>
            <Button variant="ghost" size="icon" className="h-9 w-9 rounded-lg">
              <Video className="h-4 w-4 text-muted-foreground" />
            </Button>
            <Button variant="ghost" size="icon" className="h-9 w-9 rounded-lg">
              <Search className="h-4 w-4 text-muted-foreground" />
            </Button>
            <Button variant="ghost" size="icon" className="h-9 w-9 rounded-lg">
              <MoreVertical className="h-4 w-4 text-muted-foreground" />
            </Button>
          </div>
        </div>
      </div>

      {/* Messages Area */}
      <div className="flex-1 overflow-y-auto p-6 bg-[#F9FAFE]">
        {error && (
          <Alert variant="destructive" className="mb-4">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}

        {loading ? (
          <div className="flex items-center justify-center h-full">
            <LoadingState message="Loading messages..." variant="list" count={3} />
          </div>
        ) : messages.length === 0 ? (
          <div className="text-center py-12">
            <MessageSquare className="h-12 w-12 text-muted-foreground mx-auto mb-4 opacity-50" />
            <p className="text-muted-foreground font-medium">No messages yet</p>
            <p className="text-sm text-muted-foreground mt-2">
              Send the first message to start the conversation
            </p>
          </div>
        ) : (
          <div className="space-y-1">
            {messages.map((message, index) => {
              // Determinar si es el primero o último de un grupo
              const prevMessage = index > 0 ? messages[index - 1] : null;
              const nextMessage = index < messages.length - 1 ? messages[index + 1] : null;
              
              const isFirstInGroup = !prevMessage || prevMessage.sender_id !== message.sender_id;
              const isLastInGroup = !nextMessage || nextMessage.sender_id !== message.sender_id;

              return (
                <MessageBubble
                  key={message.id}
                  message={message}
                  showAvatar={true}
                  isFirstInGroup={isFirstInGroup}
                  isLastInGroup={isLastInGroup}
                />
              );
            })}
            <div ref={messagesEndRef} />
          </div>
        )}
      </div>

      {/* Message Input */}
      <MessageInput
        onSendMessage={handleSendMessage}
        disabled={loading || sending}
        placeholder={`Type a message to ${fullName}...`}
      />
    </div>
  );
}
