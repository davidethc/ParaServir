import { useState, useRef, FormEvent, type KeyboardEvent, type ChangeEvent } from "react";
import { Button } from "@/shared/components/ui/button";
import { Textarea } from "@/shared/components/ui/textarea";
import { Send, Loader2, Paperclip } from "lucide-react";
import { cn } from "@/shared/lib/utils";
import { MessageTemplateSelector } from "./MessageTemplateSelector";

interface MessageInputProps {
  onSendMessage: (content: string) => Promise<void>;
  disabled?: boolean;
  placeholder?: string;
}

/**
 * Modern chat input with auto-resize textarea and smooth animations
 * Features: attach button, auto-resize, send on Enter, character limit
 */
export function MessageInput({ onSendMessage, disabled = false, placeholder = "Escribe un mensaje..." }: MessageInputProps) {
  const [message, setMessage] = useState("");
  const [sending, setSending] = useState(false);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    
    const trimmedMessage = message.trim();
    if (!trimmedMessage || sending || disabled) return;

    setSending(true);
    try {
      await onSendMessage(trimmedMessage);
      setMessage("");

      // Reset textarea height
      if (textareaRef.current) {
        textareaRef.current.style.height = "auto";
      }
    } catch {
      // El error ya se maneja en el componente padre
    } finally {
      setSending(false);
    }
  };

  const handleKeyDown = (e: KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      void handleSubmit(e as any);
    }
  };

  const handleChange = (e: ChangeEvent<HTMLTextAreaElement>) => {
    setMessage(e.target.value);

    // Auto-resize textarea
    if (textareaRef.current) {
      textareaRef.current.style.height = "auto";
      textareaRef.current.style.height = `${Math.min(textareaRef.current.scrollHeight, 120)}px`;
    }
  };

  const handleSelectTemplate = (content: string) => {
    setMessage(content);
    // Focus textarea after inserting template
    if (textareaRef.current) {
      textareaRef.current.focus();
      textareaRef.current.style.height = "auto";
      textareaRef.current.style.height = `${Math.min(textareaRef.current.scrollHeight, 120)}px`;
    }
  };

  const canSend = message.trim().length > 0 && !disabled && !sending;

  return (
    <div className="bg-white border-t border-border px-6 py-4">
      <form onSubmit={handleSubmit} className="flex items-end gap-3">
        {/* Attach button */}
        <Button
          type="button"
          variant="ghost"
          size="icon"
          className="h-10 w-10 shrink-0 rounded-lg"
          disabled={disabled}
          aria-label="Attach file"
          title="Attach file"
        >
          <Paperclip className="h-5 w-5 text-muted-foreground" />
        </Button>

        {/* Message template selector */}
        <MessageTemplateSelector
          onSelectTemplate={handleSelectTemplate}
          disabled={disabled || sending}
        />

        {/* Message textarea */}
        <div className="flex-1 relative">
          <Textarea
            ref={textareaRef}
            value={message}
            onChange={handleChange}
            onKeyDown={handleKeyDown}
            placeholder={placeholder}
            disabled={disabled || sending}
            rows={1}
            className={cn(
              "min-h-[44px] max-h-[120px] resize-none",
              "bg-[#F1F3FB] border-0 rounded-2xl",
              "px-4 py-3 text-sm",
              "focus-visible:ring-2 focus-visible:ring-[#58A3B0] focus-visible:ring-offset-0",
              "focus-visible:bg-white",
              "transition-all duration-200",
              "placeholder:text-muted-foreground"
            )}
            aria-label="Type message"
          />
        </div>

        {/* Send button */}
        <Button
          type="submit"
          size="icon"
          className={cn(
            "h-10 w-10 rounded-full shrink-0",
            "transition-all duration-200",
            canSend
              ? "bg-[#58A3B0] hover:bg-[#58A3B0]/90 active:scale-95 hover:scale-105 text-white"
              : "bg-[#F1F3FB] text-muted-foreground cursor-not-allowed"
          )}
          disabled={!canSend}
          aria-label="Send message"
        >
          {sending ? (
            <Loader2 className="h-4 w-4 animate-spin" />
          ) : (
            <Send className="h-4 w-4" />
          )}
        </Button>
      </form>
    </div>
  );
}

