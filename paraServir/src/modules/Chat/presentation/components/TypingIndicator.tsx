import { cn } from "@/shared/lib/utils";

/**
 * Animated typing indicator for chat
 * Shows three bouncing dots animation
 */
export function TypingIndicator({ className }: { className?: string }) {
    return (
        <div className={cn("flex gap-2 mb-4", className)}>
            <div className="flex flex-col max-w-[70%] items-start">
                <div className="rounded-lg px-4 py-3 bg-white shadow-sm border border-border/50">
                    <div className="flex items-center gap-1">
                        <div
                            className="w-1.5 h-1.5 rounded-full bg-muted-foreground/60 animate-bounce"
                            style={{ animationDelay: '0ms', animationDuration: '1.4s' }}
                        />
                        <div
                            className="w-1.5 h-1.5 rounded-full bg-muted-foreground/60 animate-bounce"
                            style={{ animationDelay: '200ms', animationDuration: '1.4s' }}
                        />
                        <div
                            className="w-1.5 h-1.5 rounded-full bg-muted-foreground/60 animate-bounce"
                            style={{ animationDelay: '400ms', animationDuration: '1.4s' }}
                        />
                    </div>
                </div>
                <span className="text-xs text-muted-foreground mt-1 px-2">
                    Escribiendo...
                </span>
            </div>
        </div>
    );
}
