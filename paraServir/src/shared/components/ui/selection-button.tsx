import * as React from "react";
import { cn } from "@/shared/lib/utils";

export interface SelectionButtonProps
  extends Omit<React.ButtonHTMLAttributes<HTMLButtonElement>, 'onSelect'> {
  selected?: boolean;
  value: string;
  onSelect?: (value: string) => void;
}

const SelectionButton = React.forwardRef<HTMLButtonElement, SelectionButtonProps>(
  ({ className, selected = false, value, onSelect, children, disabled, ...props }, ref) => {
    return (
      <button
        ref={ref}
        type="button"
        onClick={() => !disabled && onSelect?.(value)}
        disabled={disabled}
        className={cn(
          "relative inline-flex items-center justify-between gap-3 px-4 py-2.5 rounded-lg text-sm font-medium transition-all duration-200",
          "border focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary/20",
          disabled && "opacity-50 cursor-not-allowed",
          selected
            ? "border-primary bg-primary/5 text-primary shadow-sm"
            : "border-border bg-card text-muted-foreground hover:border-primary/50 hover:text-foreground hover:shadow-sm",
          className
        )}
        {...props}
      >
        <span>{children}</span>
        <div
          className={cn(
            "w-4 h-4 rounded-full border-2 transition-all flex items-center justify-center",
            selected
              ? "border-primary bg-primary"
              : "border-muted-foreground/30 bg-transparent"
          )}
        >
          {selected && (
            <div className="w-1.5 h-1.5 rounded-full bg-white" />
          )}
        </div>
      </button>
    );
  }
);

SelectionButton.displayName = "SelectionButton";

export { SelectionButton };
