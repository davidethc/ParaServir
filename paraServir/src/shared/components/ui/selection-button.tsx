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
          "relative inline-flex items-center justify-between gap-3 px-4 py-2.5 rounded-md text-sm font-medium transition-all",
          "border-2 focus:outline-none focus:ring-2 focus:ring-offset-2",
          disabled && "opacity-50 cursor-not-allowed",
          selected
            ? "border-red-600 bg-white text-gray-900 shadow-sm focus:ring-red-500"
            : "border-gray-300 bg-white text-gray-700 hover:border-gray-400 focus:ring-gray-500",
          className
        )}
        {...props}
      >
        <span>{children}</span>
        <div
          className={cn(
            "w-4 h-4 rounded-full border-2 transition-all flex items-center justify-center",
            selected
              ? "border-red-600 bg-red-600"
              : "border-gray-300 bg-transparent"
          )}
        >
          {selected && (
            <div className="w-2 h-2 rounded-full bg-white" />
          )}
        </div>
      </button>
    );
  }
);

SelectionButton.displayName = "SelectionButton";

export { SelectionButton };
