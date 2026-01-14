import { useEffect, useState, useRef, useMemo } from "react";
import { MessageBubble } from "./MessageBubble";
import { ChatInput } from "./ChatInput";
import { ChatHeader } from "./ChatHeader";
import { TypingIndicator } from "./TypingIndicator";
import { EmptyState } from "./EmptyState";
import { ChatController } from "../../infra/http/controllers/chat.controller";
import type { ConversationDto } from "../../application/dto/conversation.dto";
import type { MessageDto } from "../../application/dto/message.dto";
import { useAuth } from "@/shared/hooks/useAuth";
import { MessageSquare, ChevronDown } from "lucide-react";
import { Alert, AlertDescription } from "@/shared/components/ui/alert";
import { AlertCircle } from "lucide-react";
import { cn } from "@/shared/lib/utils";
import { format, isToday, isYesterday, isSameDay } from "date-fns";
import { es } from "date-fns/locale";
import { Button } from "@/shared/components/ui/button";

interface ChatWindowProps {
  conversation: ConversationDto | null;
  onMessageSent?: () => void;
  onBack?: () => void;
  showBackButton?: boolean;
}

/**
 * Main chat window with messages, auto-scroll, and grouping
 * Features: message grouping, date dividers, auto-scroll, new message indicator
 */
export function ChatWindow({
  conversation,
  onMessageSent,
  onBack,
  showBackButton = false,
}: ChatWindowProps) {
  const [messages, setMessages] = useState<MessageDto[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [showScrollButton, setShowScrollButton] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const messagesContainerRef = useRef<HTMLDivElement>(null);
  const { getToken } = useAuth();
  const controller = useMemo(() => new ChatController(), []);

  const scrollToBottom = (behavior: ScrollBehavior = "smooth") => {
    messagesEndRef.current?.scrollIntoView({ behavior });
  };

  const handleScroll = () => {
    if (!messagesContainerRef.current) return;

    const { scrollTop, scrollHeight, clientHeight } = messagesContainerRef.current;
    const isAtBottom = scrollHeight - scrollTop - clientHeight < 100;
    setShowScrollButton(!isAtBottom);
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

          // Scroll to bottom after loading
          setTimeout(() => scrollToBottom("auto"), 100);
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

  // Auto-scroll when new message arrives (if already at bottom)
  useEffect(() => {
    if (messages.length > 0 && messagesContainerRef.current) {
      const { scrollTop, scrollHeight, clientHeight } = messagesContainerRef.current;
      const isNearBottom = scrollHeight - scrollTop - clientHeight < 200;

      if (isNearBottom) {
        scrollToBottom();
      }
    }
  }, [messages]);

  const handleSendMessage = async (content: string) => {
    if (!conversation) return;

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

      // Scroll to bottom after sending
      setTimeout(() => scrollToBottom(), 100);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : "Error al enviar mensaje";
      setError(errorMessage);
      throw err;
    }
  };

  // Group messages and add date dividers
  const groupedMessages = useMemo(() => {
    if (messages.length === 0) return [];

    const result: Array<{ type: 'message' | 'divider'; data: any }> = [];
    let currentDate: Date | null = null;
    let lastSenderId: string | null = null;
    let groupStartIndex = 0;

    messages.forEach((message, index) => {
      const messageDate = new Date(message.created_at);

      // Add date divider if date changed
      if (!currentDate || !isSameDay(currentDate, messageDate)) {
        currentDate = messageDate;
        let dateLabel = format(messageDate, "dd 'de' MMMM, yyyy", { locale: es });

        if (isToday(messageDate)) {
          dateLabel = "Hoy";
        } else if (isYesterday(messageDate)) {
          dateLabel = "Ayer";
        }

        result.push({
          type: 'divider',
          data: { date: messageDate, label: dateLabel },
        });
      }

      // Determine if message is in a new group
      const isNewGroup = message.sender_id !== lastSenderId;
      const isFirstInGroup = isNewGroup || (index > 0 && result.push.length === 0);
      const isLastInGroup = index === messages.length - 1 || messages[index + 1]?.sender_id !== message.sender_id;

      result.push({
        type: 'message',
        data: {
          ...message,
          isFirstInGroup,
          isLastInGroup,
          showAvatar: !message.is_own && isLastInGroup,
        },
      });

      lastSenderId = message.sender_id;
      if (isNewGroup) {
        groupStartIndex = result.length - 1;
      }
    });

    return result;
  }, [messages]);

  // Empty state when no conversation selected
  if (!conversation) {
    return (
      <div className="flex items-center justify-center h-full bg-muted/20">
        <EmptyState
          icon={MessageSquare}
          title="Selecciona una conversación para comenzar"
          description="Elige un chat de la lista para ver los mensajes"
        />
      </div>
    );
  }

  const isTyping = conversation.other_user?.isTyping ?? false;

  return (
    <div className="flex flex-col h-full bg-white">
      {/* Header */}
      <ChatHeader
        conversation={conversation}
        onBack={onBack}
        showBackButton={showBackButton}
      />

      {/* Messages area */}
      <div
        ref={messagesContainerRef}
        onScroll={handleScroll}
        className="flex-1 overflow-y-auto bg-muted/20 px-6 py-6"
        style={{
          backgroundImage: 'url("data:image/svg+xml,%3Csvg width=\'60\' height=\'60\' viewBox=\'0 0 60 60\' xmlns=\'http://www.w3.org/2000/svg\'%3E%3Cg fill=\'none\' fill-rule=\'evenodd\'%3E%3Cg fill=\'%23000000\' fill-opacity=\'0.02\'%3E%3Cpath d=\'M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z\'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")',
        }}
      >
        {error && (
          <Alert variant="destructive" className="mb-4">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}

        {loading ? (
          <div className="flex items-center justify-center h-full">
            <div className="space-y-4 w-full max-w-md">
              {Array.from({ length: 3 }).map((_, i) => (
                <div
                  key={i}
                  className={cn(
                    "h-16 rounded-lg animate-pulse",
                    i % 2 === 0 ? "bg-primary/20 ml-auto w-3/4" : "bg-white w-2/3"
                  )}
                />
              ))}
            </div>
          </div>
        ) : groupedMessages.length === 0 ? (
          <EmptyState
            icon={MessageSquare}
            title="No hay mensajes aún"
            description="Envía el primer mensaje para comenzar la conversación"
          />
        ) : (
          <>
            {groupedMessages.map((item, index) =>
              item.type === 'divider' ? (
                <div key={`divider-${index}`} className="flex justify-center my-6">
                  <div className="bg-black/5 text-muted-foreground text-xs font-medium px-3 py-1.5 rounded-xl">
                    {item.data.label}
                  </div>
                </div>
              ) : (
                <MessageBubble
                  key={item.data.id}
                  message={item.data}
                  showAvatar={item.data.showAvatar}
                  isFirstInGroup={item.data.isFirstInGroup}
                  isLastInGroup={item.data.isLastInGroup}
                />
              )
            )}

            {/* Typing indicator */}
            {isTyping && <TypingIndicator />}

            <div ref={messagesEndRef} />
          </>
        )}
      </div>

      {/* Scroll to bottom button */}
      {showScrollButton && (
        <Button
          size="icon"
          className="absolute bottom-24 right-8 rounded-full shadow-lg z-10 h-10 w-10"
          onClick={() => scrollToBottom()}
          aria-label="Ir al final"
        >
          <ChevronDown className="h-5 w-5" />
        </Button>
      )}

      {/* Input */}
      <ChatInput
        onSendMessage={handleSendMessage}
        disabled={loading}
        placeholder={`Escribe un mensaje a ${conversation.other_user?.first_name || 'usuario'}...`}
      />
    </div>
  );
}
