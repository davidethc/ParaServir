import { Avatar, AvatarImage, AvatarFallback } from "@/shared/components/ui/avatar";
import { format } from "date-fns";
import { es } from "date-fns/locale";
import type { MessageDto } from "../../application/dto/message.dto";
import { cn } from "@/shared/lib/utils";

interface MessageBubbleProps {
  message: MessageDto;
}

export function MessageBubble({ message }: MessageBubbleProps) {
  const initials = message.sender_name
    .split(" ")
    .map((n) => n[0])
    .join("")
    .toUpperCase()
    .slice(0, 2);

  const formattedTime = format(new Date(message.created_at), "HH:mm", { locale: es });

  return (
    <div
      className={cn(
        "flex gap-2 mb-4",
        message.is_own ? "flex-row-reverse" : "flex-row"
      )}
    >
      {!message.is_own && (
        <Avatar className="h-8 w-8">
          <AvatarImage src={message.sender_avatar || undefined} alt={message.sender_name} />
          <AvatarFallback className="text-xs">{initials}</AvatarFallback>
        </Avatar>
      )}
      <div
        className={cn(
          "flex flex-col max-w-[70%]",
          message.is_own ? "items-end" : "items-start"
        )}
      >
        {!message.is_own && (
          <span className="text-xs text-muted-foreground mb-1 px-2">
            {message.sender_name}
          </span>
        )}
        <div
          className={cn(
            "rounded-lg px-4 py-2 text-sm",
            message.is_own
              ? "bg-primary text-primary-foreground"
              : "bg-muted text-foreground"
          )}
        >
          <p className="whitespace-pre-wrap break-words">{message.content}</p>
        </div>
        <span className="text-xs text-muted-foreground mt-1 px-2">
          {formattedTime}
        </span>
      </div>
    </div>
  );
}

