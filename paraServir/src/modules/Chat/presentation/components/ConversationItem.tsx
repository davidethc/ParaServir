import { Avatar, AvatarImage, AvatarFallback } from "@/shared/components/ui/avatar";
import { Badge } from "@/shared/components/ui/badge";
import { format, isToday, isYesterday } from "date-fns";
import { es } from "date-fns/locale";
import type { ConversationDto } from "../../application/dto/conversation.dto";
import { cn } from "@/shared/lib/utils";
import { getUserAvatar } from "@/shared/Utils/avatar-utils";
import { SERVICE_STATUS_COLORS } from "../../application/types/chat.types";

interface ConversationItemProps {
    conversation: ConversationDto;
    isSelected: boolean;
    onSelect: () => void;
}

/**
 * Modern conversation list item with glassmorphism and enhanced states
 * Features: online badge, unread count, service status, hover effects
 */
export function ConversationItem({
    conversation,
    isSelected,
    onSelect,
}: ConversationItemProps) {
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

    // Format timestamp
    const formatTimestamp = (dateString?: string | null) => {
        if (!dateString) return "";
        try {
            const date = new Date(dateString);

            if (isToday(date)) {
                return format(date, "HH:mm", { locale: es });
            }
            if (isYesterday(date)) {
                return "Ayer";
            }
            const now = new Date();
            const diffInDays = (now.getTime() - date.getTime()) / (1000 * 60 * 60 * 24);

            if (diffInDays < 7) {
                return format(date, "EEEE", { locale: es });
            }
            return format(date, "dd/MM", { locale: es });
        } catch {
            return "";
        }
    };

    const statusColor = SERVICE_STATUS_COLORS[conversation.status] || '#6B7280';
    const isOnline = otherUser?.isOnline ?? false;

    return (
        <div
            className={cn(
                "flex items-center gap-3 px-4 py-3",
                "cursor-pointer transition-all duration-200",
                "rounded-r-lg mb-0.5",
                "border-l-[3px]",
                isSelected
                    ? "bg-primary/8 border-l-primary"
                    : "border-l-transparent hover:bg-muted/50"
            )}
            onClick={onSelect}
            role="button"
            tabIndex={0}
            onKeyDown={(e) => {
                if (e.key === "Enter" || e.key === " ") {
                    e.preventDefault();
                    onSelect();
                }
            }}
            aria-label={`Conversación con ${fullName}`}
            aria-selected={isSelected}
        >
            {/* Avatar with online badge */}
            <div className="relative shrink-0">
                <Avatar className="h-12 w-12 border-2 border-white shadow-sm">
                    <AvatarImage src={displayAvatar} alt={fullName} />
                    <AvatarFallback className="text-sm font-semibold">{initials}</AvatarFallback>
                </Avatar>
                {/* Online status badge */}
                <div
                    className={cn(
                        "absolute bottom-0 right-0 w-3 h-3 rounded-full border-2 border-white",
                        isOnline ? "bg-success" : "bg-muted-foreground/50"
                    )}
                    aria-label={isOnline ? "En línea" : "Desconectado"}
                />
            </div>

            {/* Content */}
            <div className="flex-1 min-w-0">
                {/* Name and timestamp */}
                <div className="flex items-center justify-between gap-2 mb-1">
                    <h3 className="text-[15px] font-semibold text-foreground truncate">
                        {fullName}
                    </h3>
                    <span className="text-xs text-muted-foreground/70 shrink-0">
                        {formatTimestamp(conversation.last_message_at)}
                    </span>
                </div>

                {/* Last message preview */}
                {conversation.last_message && (
                    <p className="text-[13px] text-muted-foreground truncate mb-1.5">
                        {conversation.last_message}
                    </p>
                )}

                {/* Service status badge and unread count */}
                <div className="flex items-center justify-between gap-2">
                    <Badge
                        className="text-[11px] font-semibold px-2 py-0.5 rounded-xl"
                        style={{
                            backgroundColor: statusColor,
                            color: 'white',
                        }}
                    >
                        {conversation.status}
                    </Badge>

                    {/* Unread count badge */}
                    {conversation.unread_count > 0 && (
                        <div
                            className="flex items-center justify-center w-5 h-5 rounded-full bg-primary text-white text-[11px] font-bold"
                            aria-label={`${conversation.unread_count} mensajes sin leer`}
                        >
                            {conversation.unread_count > 9 ? '9+' : conversation.unread_count}
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}
