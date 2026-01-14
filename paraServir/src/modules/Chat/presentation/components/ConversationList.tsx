import { useState, useMemo } from "react";
import { Input } from "@/shared/components/ui/input";
import { Tabs, TabsList, TabsTrigger } from "@/shared/components/ui/tabs";
import { Search, MessageCircle } from "lucide-react";
import { ConversationItem } from "./ConversationItem";
import { EmptyState } from "./EmptyState";
import type { ConversationDto } from "../../application/dto/conversation.dto";
import type { ConversationFilter } from "../../application/types/chat.types";
import { cn } from "@/shared/lib/utils";

interface ConversationListProps {
  conversations: ConversationDto[];
  selectedConversationId?: string;
  onSelectConversation: (conversation: ConversationDto) => void;
  loading?: boolean;
}

/**
 * Modern conversation list with search, filters, and smooth scrolling
 * Features: search, filter tabs, custom scrollbar, empty states
 */
export function ConversationList({
  conversations,
  selectedConversationId,
  onSelectConversation,
  loading = false,
}: ConversationListProps) {
  const [searchQuery, setSearchQuery] = useState("");
  const [activeFilter, setActiveFilter] = useState<ConversationFilter>("all");

  // Filter and search conversations
  const filteredConversations = useMemo(() => {
    let result = [...conversations];

    // Apply search
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase();
      result = result.filter((conv) => {
        const fullName = `${conv.other_user?.first_name} ${conv.other_user?.last_name}`.toLowerCase();
        const lastMessage = conv.last_message?.toLowerCase() || "";
        return fullName.includes(query) || lastMessage.includes(query);
      });
    }

    // Apply filter
    switch (activeFilter) {
      case "active":
        result = result.filter((conv) =>
          conv.status === "pending" || conv.status === "accepted"
        );
        break;
      case "archived":
        result = result.filter((conv) => conv.isArchived === true);
        break;
      default:
        // "all" - show non-archived
        result = result.filter((conv) => !conv.isArchived);
        break;
    }

    // Sort by: pinned first, then by last message time
    result.sort((a, b) => {
      if (a.isPinned && !b.isPinned) return -1;
      if (!a.isPinned && b.isPinned) return 1;

      const aTime = a.last_message_at ? new Date(a.last_message_at).getTime() : 0;
      const bTime = b.last_message_at ? new Date(b.last_message_at).getTime() : 0;
      return bTime - aTime;
    });

    return result;
  }, [conversations, searchQuery, activeFilter]);

  return (
    <div className="flex flex-col h-full bg-white border-r border-border">
      {/* Header */}
      <div className="px-4 py-5 border-b border-border">
        <h1 className="text-2xl font-bold text-foreground mb-1">Chats</h1>
        <p className="text-sm text-muted-foreground">
          {conversations.length} {conversations.length === 1 ? "conversación" : "conversaciones"}
        </p>
      </div>

      {/* Search bar */}
      <div className="px-4 py-3">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            type="text"
            placeholder="Buscar conversaciones..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10 bg-white border-border rounded-lg"
          />
        </div>
      </div>

      {/* Filter tabs */}
      <div className="px-4 pb-2">
        <Tabs value={activeFilter} onValueChange={(v) => setActiveFilter(v as ConversationFilter)}>
          <TabsList className="w-full grid grid-cols-3 bg-muted/30">
            <TabsTrigger
              value="all"
              className={cn(
                "text-sm data-[state=active]:bg-primary/10",
                "data-[state=active]:border-b-2 data-[state=active]:border-primary"
              )}
            >
              Todos
            </TabsTrigger>
            <TabsTrigger
              value="active"
              className={cn(
                "text-sm data-[state=active]:bg-primary/10",
                "data-[state=active]:border-b-2 data-[state=active]:border-primary"
              )}
            >
              Activos
            </TabsTrigger>
            <TabsTrigger
              value="archived"
              className={cn(
                "text-sm data-[state=active]:bg-primary/10",
                "data-[state=active]:border-b-2 data-[state=active]:border-primary"
              )}
            >
              Archivados
            </TabsTrigger>
          </TabsList>
        </Tabs>
      </div>

      {/* Conversation list */}
      <div
        className={cn(
          "flex-1 overflow-y-auto",
          // Custom scrollbar
          "scrollbar-thin scrollbar-thumb-rounded-full",
          "scrollbar-track-transparent scrollbar-thumb-muted-foreground/20",
          "hover:scrollbar-thumb-muted-foreground/30"
        )}
        style={{
          scrollbarWidth: 'thin',
          scrollbarColor: '#D1D5DB transparent',
        }}
      >
        {loading ? (
          <div className="p-4 space-y-2">
            {Array.from({ length: 5 }).map((_, i) => (
              <div
                key={i}
                className="h-16 bg-muted/50 rounded-lg animate-pulse"
              />
            ))}
          </div>
        ) : filteredConversations.length === 0 ? (
          searchQuery ? (
            <EmptyState
              icon={Search}
              title="No se encontraron resultados"
              description={`No hay conversaciones que coincidan con "${searchQuery}"`}
            />
          ) : (
            <EmptyState
              icon={MessageCircle}
              title={
                activeFilter === "archived"
                  ? "No hay conversaciones archivadas"
                  : "No hay conversaciones aún"
              }
              description={
                activeFilter === "archived"
                  ? "Las conversaciones archivadas aparecerán aquí"
                  : "Tus chats aparecerán cuando tengas solicitudes de servicio activas"
              }
            />
          )
        ) : (
          <div className="py-2">
            {filteredConversations.map((conversation) => (
              <ConversationItem
                key={conversation.id}
                conversation={conversation}
                isSelected={selectedConversationId === conversation.request_id}
                onSelect={() => onSelectConversation(conversation)}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
