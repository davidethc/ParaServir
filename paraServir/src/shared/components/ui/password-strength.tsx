import * as React from "react"
import { cn } from "@/shared/lib/utils"
import { Check, X } from "lucide-react"

interface PasswordRequirement {
  label: string
  test: (password: string) => boolean
}

interface PasswordStrengthProps {
  password: string
  requirements?: PasswordRequirement[]
  className?: string
}

const defaultRequirements: PasswordRequirement[] = [
  { label: "8 caracteres", test: (pwd) => pwd.length >= 8 },
  { label: "Letra mayúscula (A-Z)", test: (pwd) => /[A-Z]/.test(pwd) },
  { label: "Números (0-9)", test: (pwd) => /[0-9]/.test(pwd) },
  { label: "Carácter especial (@$!%*?&)", test: (pwd) => /[@$!%*?&]/.test(pwd) },
]

export function PasswordStrength({ 
  password, 
  requirements = defaultRequirements,
  className 
}: PasswordStrengthProps) {
  if (!password) return null

  return (
    <div className={cn("space-y-1.5 mt-2", className)}>
      {requirements.map((req, index) => {
        const isValid = req.test(password)
        return (
          <div 
            key={index} 
            className={cn(
              "flex items-center gap-2 text-xs transition-colors duration-200",
              isValid ? "text-green-600 dark:text-green-400" : "text-muted-foreground"
            )}
          >
            {isValid ? (
              <Check className="h-3.5 w-3.5 flex-shrink-0" />
            ) : (
              <X className="h-3.5 w-3.5 flex-shrink-0 opacity-50" />
            )}
            <span>{req.label}</span>
          </div>
        )
      })}
    </div>
  )
}
