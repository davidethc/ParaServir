import { useState, useCallback, useEffect, useMemo } from "react";
import { useSearchParams, useNavigate } from "react-router-dom";
import { ConversationList } from "@/modules/Chat/presentation/components/ConversationList";
import { ChatWindow } from "@/modules/Chat/presentation/components/ChatWindow";
import type { ConversationDto } from "@/modules/Chat/application/dto/conversation.dto";
import { ChatController } from "@/modules/Chat/infra/http/controllers/chat.controller";
import { useAuth } from "@/shared/hooks/useAuth";
import { Alert, AlertDescription } from "@/shared/components/ui/alert";
import { AlertCircle, MessageSquare } from "lucide-react";
import { LoadingState } from "@/shared/components/feedback/LoadingState";

export function DashboardChatsPage() {
  const [selectedConversation, setSelectedConversation] = useState<ConversationDto | null>(null);
  const [conversations, setConversations] = useState<ConversationDto[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchParams, setSearchParams] = useSearchParams();
  const navigate = useNavigate();
  const conversationIdFromUrl = searchParams.get("conversation");
  const { getToken } = useAuth();
  const controller = useMemo(() => new ChatController(), []);

  // Cargar conversaciones y seleccionar la que viene de la URL
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

        // Si hay un conversationId en la URL, seleccionar esa conversación
        if (conversationIdFromUrl) {
          const conversation = response.conversations?.find(
            (c) => c.id === conversationIdFromUrl || c.request_id === conversationIdFromUrl
          );
          if (conversation) {
            setSelectedConversation(conversation);
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
  }, [conversationIdFromUrl, controller, getToken]);

  const handleSelectConversation = useCallback((conversation: ConversationDto) => {
    setSelectedConversation(conversation);
    // Actualizar URL con el ID de la conversación
    const newParams = new URLSearchParams(searchParams);
    newParams.set("conversation", conversation.id || conversation.request_id);
    setSearchParams(newParams, { replace: true });
  }, [searchParams, setSearchParams]);

  const handleMessageSent = useCallback(() => {
    // Recargar conversaciones para actualizar el último mensaje
    const loadConversations = async () => {
      try {
        const token = getToken();
        if (!token) return;
        const response = await controller.getConversations(token);
        setConversations(response.conversations || []);
      } catch {
        // Silenciar errores en recarga automática
      }
    };
    void loadConversations();
  }, [controller, getToken]);

  return (
    <div className="h-[calc(100vh-64px)] bg-[#F9FAFE] flex flex-col overflow-hidden">
      {error && (
        <Alert variant="destructive" className="m-4 mx-6">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}
      
      <div className="flex flex-1 overflow-hidden">
        {/* Sidebar izquierdo - Lista de conversaciones */}
        <div className="w-96 border-r border-border bg-white overflow-hidden flex flex-col">
          {/* Header del sidebar */}
          <div className="px-6 py-5 border-b border-border bg-white">
            <h2 className="text-2xl font-bold text-foreground mb-2">Chats</h2>
            <p className="text-sm text-muted-foreground">Your conversations</p>
          </div>

          {/* Lista de conversaciones */}
          <div className="flex-1 overflow-y-auto p-4">
            {loading ? (
              <LoadingState message="Cargando conversaciones..." variant="list" count={5} />
            ) : (
              <ConversationList
                selectedConversationId={selectedConversation?.id || selectedConversation?.request_id}
                onSelectConversation={handleSelectConversation}
              />
            )}
          </div>
        </div>

        {/* Área principal - Chat */}
        <div className="flex-1 overflow-hidden">
          <ChatWindow
            conversation={selectedConversation}
            onMessageSent={handleMessageSent}
          />
        </div>
      </div>
    </div>
  );
}
