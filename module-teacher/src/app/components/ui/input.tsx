import * as React from "react"

import { cn } from "@/lib/utils"

export interface InputProps
  extends React.InputHTMLAttributes<HTMLInputElement> {}

const Input = React.forwardRef<HTMLInputElement, InputProps>(
  ({ className, type, ...props }, ref) => {
    return (
      <input
        type={type}
        className={cn(
          "flex h-9 w-full rounded-md border border-border-strong bg-surface",
          "px-3 py-1.5 text-sm text-ink-900 placeholder:text-ink-400",
          "shadow-[0_1px_2px_rgba(16,32,51,0.04)] transition-[border-color,box-shadow,background-color,color] duration-200",
          "hover:border-accent/60",
          "focus:outline-none focus:border-accent focus:ring-2 focus:ring-accent/15",
          "disabled:cursor-not-allowed disabled:opacity-50",
          "file:border-0 file:bg-transparent file:text-sm file:font-medium file:text-ink-700",
          className
        )}
        ref={ref}
        {...props}
      />
    )
  }
)
Input.displayName = "Input"

export { Input }
