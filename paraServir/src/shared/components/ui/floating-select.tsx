import * as React from "react"
import { cn } from "@/shared/lib/utils"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/shared/components/ui/select"

export interface FloatingSelectProps {
  id: string
  label: string
  value: string
  onValueChange: (value: string) => void
  placeholder?: string
  options: { value: string; label: string }[]
  error?: string
  helperText?: string
  required?: boolean
  className?: string
}

const FloatingSelect = React.forwardRef<
  React.ElementRef<typeof SelectTrigger>,
  FloatingSelectProps
>(({ 
  id, 
  label, 
  value, 
  onValueChange, 
  placeholder = "Selecciona una opción",
  options,
  error,
  helperText,
  required,
  className 
}, ref) => {
  const [isOpen, setIsOpen] = React.useState(false)
  const hasValue = Boolean(value && value.length > 0)
  const shouldFloat = isOpen || hasValue

  return (
    <div className="relative">
      <div className="relative">
        <Select 
          value={value} 
          onValueChange={(val) => {
            onValueChange(val)
            setIsOpen(false)
          }}
          onOpenChange={setIsOpen}
        >
          <SelectTrigger
            ref={ref}
            id={id}
            className={cn(
              "h-12 pt-6 pb-2 px-4 rounded-lg",
              "text-foreground",
              error 
                ? "border-destructive focus:border-destructive focus:ring-destructive/20" 
                : "border-border",
              className
            )}
          >
            <SelectValue placeholder="" />
          </SelectTrigger>
          <SelectContent>
            {options.map((option) => (
              <SelectItem key={option.value} value={option.value}>
                {option.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        <label
          htmlFor={id}
          className={cn(
            "absolute left-4 transition-all duration-200 pointer-events-none z-10",
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
})
FloatingSelect.displayName = "FloatingSelect"

export { FloatingSelect }
