import { useState, useRef, type KeyboardEvent, type ChangeEvent } from "react";
import { Button } from "@/shared/components/ui/button";
import { Textarea } from "@/shared/components/ui/textarea";
import { Send, Paperclip } from "lucide-react";
import { cn } from "@/shared/lib/utils";

interface ChatInputProps {
    onSendMessage: (message: string) => Promise<void>;
    disabled?: boolean;
    placeholder?: string;
}

/**
 * Modern chat input with auto-resize textarea and smooth animations
 * Features: attach button, auto-resize, send on Enter, character limit
 */
export function ChatInput({
    onSendMessage,
    disabled = false,
    placeholder = "Escribe un mensaje...",
}: ChatInputProps) {
    const [message, setMessage] = useState("");
    const [sending, setSending] = useState(false);
    const textareaRef = useRef<HTMLTextAreaElement>(null);

    const handleSend = async () => {
        if (!message.trim() || disabled || sending) return;

        setSending(true);
        try {
            await onSendMessage(message.trim());
            setMessage("");

            // Reset textarea height
            if (textareaRef.current) {
                textareaRef.current.style.height = "auto";
            }
        } catch (error) {
            console.error("Error sending message:", error);
        } finally {
            setSending(false);
        }
    };

    const handleKeyDown = (e: KeyboardEvent<HTMLTextAreaElement>) => {
        if (e.key === "Enter" && !e.shiftKey) {
            e.preventDefault();
            void handleSend();
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

    const canSend = message.trim().length > 0 && !disabled && !sending;

    return (
        <div className="bg-white border-t border-border px-6 py-4 sticky bottom-0">
            <div className="flex items-end gap-3">
                {/* Attach button */}
                <Button
                    type="button"
                    variant="ghost"
                    size="icon"
                    className="h-10 w-10 shrink-0"
                    disabled={disabled}
                    aria-label="Adjuntar archivo"
                    title="Adjuntar archivo"
                >
                    <Paperclip className="h-5 w-5 text-muted-foreground" />
                </Button>

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
                            "min-h-[40px] max-h-[120px] resize-none",
                            "bg-muted/30 border-border rounded-[20px]",
                            "px-4 py-2.5 text-sm",
                            "focus-visible:ring-primary focus-visible:ring-offset-0",
                            "focus-visible:border-primary focus-visible:shadow-input-focus",
                            "transition-all duration-200"
                        )}
                        aria-label="Escribir mensaje"
                    />
                </div>

                {/* Send button */}
                <Button
                    type="button"
                    size="icon"
                    className={cn(
                        "h-10 w-10 rounded-full shrink-0",
                        "transition-all duration-200",
                        canSend
                            ? "bg-primary hover:bg-primary/90 active:scale-95 hover:scale-105"
                            : "bg-muted text-muted-foreground cursor-not-allowed"
                    )}
                    onClick={handleSend}
                    disabled={!canSend}
                    aria-label="Enviar mensaje"
                >
                    <Send className="h-4 w-4" />
                </Button>
            </div>

            {/* Helper text */}
            <p className="text-xs text-muted-foreground/60 mt-2 text-center">
                Presiona Enter para enviar, Shift + Enter para nueva línea
            </p>
        </div>
    );
}
