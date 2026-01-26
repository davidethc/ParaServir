import { Avatar, AvatarImage, AvatarFallback } from "@/shared/components/ui/avatar";
import { format } from "date-fns";
import { es } from "date-fns/locale";
import { Check, CheckCheck } from "lucide-react";
import type { MessageDto } from "../../application/dto/message.dto";
import { cn } from "@/shared/lib/utils";
import { getUserAvatar } from "@/shared/utils/avatar-utils";

interface MessageBubbleProps {
  message: MessageDto;
  showAvatar?: boolean;
  isFirstInGroup?: boolean;
  isLastInGroup?: boolean;
}

/**
 * Modern message bubble with WhatsApp-like design
 * Features: read status, timestamps, grouping support, rounded corners
 */
export function MessageBubble({
  message,
  showAvatar = true,
  isFirstInGroup = true,
  isLastInGroup = true,
}: MessageBubbleProps) {
  const initials = message.sender_name
    .split(" ")
    .map((n) => n[0])
    .join("")
    .toUpperCase()
    .slice(0, 2);

  const formattedTime = format(new Date(message.created_at), "HH:mm", { locale: es });

  const displayAvatar = getUserAvatar(
    message.sender_id || "",
    message.sender_avatar,
    message.sender_name
  );

  // Determine bubble border radius based on position in group
  const getBorderRadius = () => {
    if (message.is_own) {
      if (!isFirstInGroup && !isLastInGroup) return "rounded-lg"; // Middle
      if (!isFirstInGroup) return "rounded-lg rounded-br-sm"; // Last
      if (!isLastInGroup) return "rounded-lg rounded-tr-sm"; // First
      return "rounded-2xl rounded-br-sm"; // Single
    } else {
      if (!isFirstInGroup && !isLastInGroup) return "rounded-lg"; // Middle
      if (!isFirstInGroup) return "rounded-lg rounded-bl-sm"; // Last
      if (!isLastInGroup) return "rounded-lg rounded-tl-sm"; // First
      return "rounded-2xl rounded-bl-sm"; // Single
    }
  };

  // Message status icon (only for own messages)
  const StatusIcon = message.is_own ? (
    (message as any).status === 'read' ? (
      <CheckCheck className="h-4 w-4 text-blue-500" />
    ) : (message as any).status === 'delivered' ? (
      <CheckCheck className="h-4 w-4 text-white/80" />
    ) : (
      <Check className="h-4 w-4 text-white/80" />
    )
  ) : null;

  const marginBottom = isLastInGroup ? "mb-4" : "mb-0.5";

  return (
    <div
      className={cn(
        "flex gap-2",
        marginBottom,
        message.is_own ? "flex-row-reverse" : "flex-row"
      )}
    >
      {/* Avatar (only for other user's messages and last in group) */}
      {!message.is_own && showAvatar && isLastInGroup && (
        <Avatar className="h-8 w-8 shrink-0 border border-border">
          <AvatarImage src={displayAvatar} alt={message.sender_name} />
          <AvatarFallback className="bg-[#58A3B0] text-white text-xs font-semibold">{initials}</AvatarFallback>
        </Avatar>
      )}
      {!message.is_own && (!showAvatar || !isLastInGroup) && (
        <div className="h-8 w-8 shrink-0" />
      )}

      {/* Message content */}
      <div
        className={cn(
          "flex flex-col max-w-[70%]",
          message.is_own ? "items-end" : "items-start"
        )}
      >
        {/* Sender name (only for first message in group from other user) */}
        {!message.is_own && isFirstInGroup && (
          <span className="text-xs text-muted-foreground mb-1 px-2">
            {message.sender_name}
          </span>
        )}

        {/* Message bubble */}
        <div
          className={cn(
            getBorderRadius(),
            "px-3 py-2 shadow-sm",
            message.is_own
              ? "bg-[#58A3B0] text-white"
              : "bg-white text-foreground border border-border/50"
          )}
        >
          <p className={cn(
            "text-sm leading-relaxed whitespace-pre-wrap break-words",
            message.is_own ? "text-white" : "text-foreground"
          )}>
            {message.content}
          </p>

          {/* Timestamp and status */}
          <div
            className={cn(
              "flex items-center gap-1 justify-end mt-1 text-[11px]",
              message.is_own ? "text-white/80" : "text-muted-foreground/70"
            )}
          >
            <span>{formattedTime}</span>
            {StatusIcon}
          </div>
        </div>
      </div>
    </div>
  );
}

