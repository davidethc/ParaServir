import { useState, useCallback, useEffect, useMemo } from "react";
import { useSearchParams } from "react-router-dom";
import { ConversationList } from "@/modules/Chat/presentation/components/ConversationList";
import { ChatWindow } from "@/modules/Chat/presentation/components/ChatWindow";
import type { ConversationDto } from "@/modules/Chat/application/dto/conversation.dto";
import { ChatController } from "@/modules/Chat/infra/http/controllers/chat.controller";
import { useAuth } from "@/shared/hooks/useAuth";
import { Alert, AlertDescription } from "@/shared/components/ui/alert";
import { AlertCircle } from "lucide-react";
import { cn } from "@/shared/lib/utils";

/**
 * Main chat page with responsive two-panel layout
 * Desktop: 30% conversations + 70% chat
 * Tablet: 40% conversations + 60% chat
 * Mobile: Single panel with navigation
 */
export function DashboardChatsPage() {
  const [selectedConversation, setSelectedConversation] = useState<ConversationDto | null>(null);
  const [conversations, setConversations] = useState<ConversationDto[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showChat, setShowChat] = useState(false); // For mobile navigation
  const [searchParams, setSearchParams] = useSearchParams();
  const requestIdFromUrl = searchParams.get("requestId");
  const { getToken } = useAuth();
  const controller = useMemo(() => new ChatController(), []);

  // Load conversations
  useEffect(() => {
    const loadConversations = async () => {
      setLoading(true);
      setError(null);
      try {
        const token = getToken();
        if (!token) {
          setError("Sesión expirada. Inicia sesión nuevamente.");
          setLoading(false);
          return;
        }

        const response = await controller.getConversations(token);
        setConversations(response.conversations || []);

        // If URL has requestId, select that conversation
        if (requestIdFromUrl) {
          const conversation = response.conversations?.find(
            (c) => c.request_id === requestIdFromUrl
          );
          if (conversation) {
            setSelectedConversation(conversation);
            setShowChat(true); // Show chat on mobile
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
  }, [requestIdFromUrl, controller, getToken]);

  const handleSelectConversation = useCallback((conversation: ConversationDto) => {
    setSelectedConversation(conversation);
    setShowChat(true); // Show chat panel on mobile

    // Clear URL param when manually selecting
    if (requestIdFromUrl) {
      const newParams = new URLSearchParams(searchParams);
      newParams.delete("requestId");
      setSearchParams(newParams, { replace: true });
    }
  }, [requestIdFromUrl, searchParams, setSearchParams]);

  const handleMessageSent = useCallback(() => {
    // Reload conversations to update last message
    const loadConversations = async () => {
      try {
        const token = getToken();
        if (!token) return;
        const response = await controller.getConversations(token);
        setConversations(response.conversations || []);
      } catch {
        // Silent fail on auto-refresh
      }
    };
    void loadConversations();
  }, [controller, getToken]);

  const handleBackToList = useCallback(() => {
    setShowChat(false);
  }, []);

  return (
    <div className="h-screen overflow-hidden bg-muted/20">
      {/* Error alert (if any) */}
      {error && (
        <div className="absolute top-4 left-1/2 -translate-x-1/2 z-50 w-full max-w-md px-4">
          <Alert variant="destructive">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        </div>
      )}

      {/* Two-panel layout */}
      <div className="grid grid-cols-1 lg:grid-cols-[30%_70%] xl:grid-cols-[28%_72%] h-full">
        {/* Left Panel - Conversation List */}
        <div
          className={cn(
            "h-full",
            // Mobile: hide when chat is shown
            showChat ? "hidden lg:block" : "block"
          )}
        >
          <ConversationList
            conversations={conversations}
            selectedConversationId={selectedConversation?.request_id}
            onSelectConversation={handleSelectConversation}
            loading={loading}
          />
        </div>

        {/* Right Panel - Chat Window */}
        <div
          className={cn(
            "h-full",
            // Mobile: hide when list is shown
            !showChat ? "hidden lg:block" : "block"
          )}
        >
          <ChatWindow
            conversation={selectedConversation}
            onMessageSent={handleMessageSent}
            onBack={handleBackToList}
            showBackButton={true}
          />
        </div>
      </div>
    </div>
  );
}
