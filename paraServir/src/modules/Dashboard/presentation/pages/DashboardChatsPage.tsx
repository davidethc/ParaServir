import { useState, useCallback, useEffect, useMemo } from "react";
import { useSearchParams, useNavigate } from "react-router-dom";
import { PageContainer } from "@/shared/components/layout/PageContainer";
import { PageHeader } from "@/shared/components/layout/PageHeader";
import { ConversationList } from "@/modules/Chat/presentation/components/ConversationList";
import { ChatWindow } from "@/modules/Chat/presentation/components/ChatWindow";
import type { ConversationDto } from "@/modules/Chat/application/dto/conversation.dto";
import { ChatController } from "@/modules/Chat/infra/http/controllers/chat.controller";
import { useAuth } from "@/shared/hooks/useAuth";
import { Alert, AlertDescription } from "@/shared/components/ui/alert";
import { AlertCircle } from "lucide-react";
import { LoadingState } from "@/shared/components/feedback/LoadingState";

export function DashboardChatsPage() {
  const [selectedConversation, setSelectedConversation] = useState<ConversationDto | null>(null);
  const [conversations, setConversations] = useState<ConversationDto[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchParams, setSearchParams] = useSearchParams();
  const navigate = useNavigate();
  const requestIdFromUrl = searchParams.get("requestId");
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

        // Si hay un requestId en la URL, seleccionar esa conversación
        if (requestIdFromUrl) {
          const conversation = response.conversations?.find(
            (c) => c.request_id === requestIdFromUrl
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
  }, [requestIdFromUrl, controller, getToken]);

  const handleSelectConversation = useCallback((conversation: ConversationDto) => {
    setSelectedConversation(conversation);
    // Limpiar el parámetro de URL cuando se selecciona manualmente
    if (requestIdFromUrl) {
      const newParams = new URLSearchParams(searchParams);
      newParams.delete("requestId");
      setSearchParams(newParams, { replace: true });
    }
  }, [requestIdFromUrl, searchParams, setSearchParams]);

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
    <PageContainer>
      <PageHeader
        title="Chats"
        description="Conversaciones con trabajadores y clientes"
      />
      {error && (
        <Alert variant="destructive" className="mb-4">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 h-[calc(100vh-200px)]">
        <div className="lg:col-span-1 overflow-y-auto">
          {loading ? (
            <LoadingState message="Cargando conversaciones..." variant="list" count={3} />
          ) : (
            <ConversationList
              selectedConversationId={selectedConversation?.request_id}
              onSelectConversation={handleSelectConversation}
            />
          )}
        </div>
        <div className="lg:col-span-2">
          <ChatWindow
            conversation={selectedConversation}
            onMessageSent={handleMessageSent}
          />
        </div>
      </div>
    </PageContainer>
  );
}
