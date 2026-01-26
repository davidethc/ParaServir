import { Avatar, AvatarImage, AvatarFallback } from "@/shared/components/ui/avatar";
import { Button } from "@/shared/components/ui/button";
import { Search, MoreVertical, ChevronLeft, Clock } from "lucide-react";
import type { ConversationDto } from "../../application/dto/conversation.dto";
import { cn } from "@/shared/lib/utils";
import { getUserAvatar } from "@/shared/utils/avatar-utils";
import { formatDistanceToNow } from "date-fns";
import { es } from "date-fns/locale";

interface ChatHeaderProps {
    conversation: ConversationDto;
    onBack?: () => void;
    onSearchToggle?: () => void;
    onMenuToggle?: () => void;
    showBackButton?: boolean;
}

/**
 * Enhanced chat header with user info, online status, and actions
 * Features: typing indicator, last seen, search, menu
 */
export function ChatHeader({
    conversation,
    onBack,
    onSearchToggle,
    onMenuToggle,
    showBackButton = false,
}: ChatHeaderProps) {
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
    const displayAvatar = getUserAvatar(
        otherUser?.id || conversation.id,
        otherUser?.avatar,
        fullName
    );

    const isOnline = (otherUser as any)?.isOnline ?? false;
    const isTyping = (otherUser as any)?.isTyping ?? false;
    const lastSeen = (otherUser as any)?.lastSeen;

    // Format status text
    const getStatusText = () => {
        if (isTyping) {
            return <span className="text-success font-medium">Escribiendo...</span>;
        }
        if (isOnline) {
            return <span className="text-success">En línea</span>;
        }
        if (lastSeen) {
            try {
                const lastSeenDate = new Date(lastSeen);
                const timeAgo = formatDistanceToNow(lastSeenDate, { addSuffix: true, locale: es });
                return (
                    <span className="flex items-center gap-1 text-muted-foreground">
                        <Clock className="h-3 w-3" />
                        {timeAgo}
                    </span>
                );
            } catch {
                return null;
            }
        }
        return null;
    };

    return (
        <div className="bg-white border-b border-border px-6 py-4 sticky top-0 z-10 shadow-sm">
            <div className="flex items-center justify-between gap-4">
                {/* Left: User info */}
                <div className="flex items-center gap-3 flex-1 min-w-0">
                    {/* Back button (mobile only) */}
                    {showBackButton && onBack && (
                        <Button
                            variant="ghost"
                            size="icon"
                            className="lg:hidden shrink-0"
                            onClick={onBack}
                            aria-label="Volver a la lista de conversaciones"
                        >
                            <ChevronLeft className="h-5 w-5" />
                        </Button>
                    )}

                    {/* Avatar with online badge */}
                    <div className="relative shrink-0">
                        <Avatar className="h-10 w-10">
                            <AvatarImage src={displayAvatar} alt={fullName} />
                            <AvatarFallback className="text-sm">{initials}</AvatarFallback>
                        </Avatar>
                        <div
                            className={cn(
                                "absolute bottom-0 right-0 w-3 h-3 rounded-full border-2 border-white",
                                isOnline ? "bg-success" : "bg-muted-foreground/50"
                            )}
                        />
                    </div>

                    {/* User name and status */}
                    <div className="flex-1 min-w-0">
                        <h2 className="text-base font-semibold text-foreground truncate">
                            {fullName}
                        </h2>
                        <div className="flex items-center gap-2 text-[13px]">
                            {getStatusText()}
                            <span className="text-muted-foreground">•</span>
                            <button
                                className="text-muted-foreground hover:text-foreground transition-colors text-xs"
                                onClick={() => {
                                    // TODO: Navigate to request detail
                                }}
                                aria-label="Ver detalles de la solicitud"
                            >
                                Solicitud #{conversation.request_id.slice(0, 8)}
                            </button>
                        </div>
                    </div>
                </div>

                {/* Right: Actions */}
                <div className="flex items-center gap-1 shrink-0">
                    {/* Search button */}
                    {onSearchToggle && (
                        <Button
                            variant="ghost"
                            size="icon"
                            className="h-9 w-9"
                            onClick={onSearchToggle}
                            aria-label="Buscar en la conversación"
                        >
                            <Search className="h-4 w-4 text-muted-foreground" />
                        </Button>
                    )}

                    {/* Menu button */}
                    {onMenuToggle && (
                        <Button
                            variant="ghost"
                            size="icon"
                            className="h-9 w-9"
                            onClick={onMenuToggle}
                            aria-label="Más opciones"
                        >
                            <MoreVertical className="h-4 w-4 text-muted-foreground" />
                        </Button>
                    )}
                </div>
            </div>
        </div>
    );
}
