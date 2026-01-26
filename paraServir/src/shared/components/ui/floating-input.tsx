import * as React from "react"
import { cn } from "@/shared/lib/utils"

export interface FloatingInputProps extends React.ComponentProps<"input"> {
  label: string
  error?: string
  helperText?: string
  required?: boolean
}

const FloatingInput = React.forwardRef<HTMLInputElement, FloatingInputProps>(
  ({ className, label, error, helperText, required, id, value, ...props }, ref) => {
    const [isFocused, setIsFocused] = React.useState(false)
    const hasValue = Boolean(value && String(value).length > 0)
    const shouldFloat = isFocused || hasValue

    return (
      <div className="relative">
        <div className="relative">
          <input
            id={id}
            ref={ref}
            value={value}
            onFocus={() => setIsFocused(true)}
            onBlur={() => setIsFocused(false)}
            className={cn(
              "peer flex h-12 w-full rounded-lg border bg-card px-4 pt-6 pb-2 text-sm",
              "text-foreground shadow-sm transition-all duration-200",
              "file:border-0 file:bg-transparent file:text-sm file:font-medium",
              "placeholder:text-transparent",
              "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/20",
              "focus-visible:border-primary",
              "hover:border-primary/50",
              "disabled:cursor-not-allowed disabled:opacity-50 disabled:bg-muted",
              error 
                ? "border-destructive focus-visible:border-destructive focus-visible:ring-destructive/20" 
                : "border-border",
              className
            )}
            {...props}
          />
          <label
            htmlFor={id}
            className={cn(
              "absolute left-4 transition-all duration-200 pointer-events-none z-0",
              "text-muted-foreground",
              shouldFloat
                ? "top-2 text-xs font-medium text-foreground"
                : "top-1/2 -translate-y-1/2 text-sm",
              error && shouldFloat && "text-destructive",
              error && !shouldFloat && "text-destructive/70"
            )}
          >
            {label}
            {required && <span className="text-destructive ml-1">*</span>}
          </label>
        </div>
        {(error || helperText) && (
          <p className={cn(
            "text-xs mt-1.5 px-1",
            error ? "text-destructive" : "text-muted-foreground"
          )}>
            {error || helperText}
          </p>
        )}
      </div>
    )
  }
)
FloatingInput.displayName = "FloatingInput"

export { FloatingInput }
