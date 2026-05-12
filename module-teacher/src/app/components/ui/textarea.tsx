import * as React from "react"

import { cn } from "@/lib/utils"

export interface TextareaProps
  extends React.TextareaHTMLAttributes<HTMLTextAreaElement> {}

const Textarea = React.forwardRef<HTMLTextAreaElement, TextareaProps>(
  ({ className, ...props }, ref) => {
    return (
      <textarea
        className={cn(
          "flex min-h-[80px] w-full rounded-md border border-border-strong bg-surface",
          "px-3 py-2 text-sm text-ink-900 placeholder:text-ink-400 leading-relaxed",
          "shadow-[0_1px_2px_rgba(16,32,51,0.04)] transition-[border-color,box-shadow,background-color,color] duration-200 resize-y",
          "hover:border-accent/60",
          "focus:outline-none focus:border-accent focus:ring-2 focus:ring-accent/15",
          "disabled:cursor-not-allowed disabled:opacity-50",
          className
        )}
        ref={ref}
        {...props}
      />
    )
  }
)
Textarea.displayName = "Textarea"

export { Textarea }
