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
          "transition-colors duration-150 resize-y",
          "hover:border-ink-400",
          "focus:outline-none focus:border-ink-900 focus:ring-0",
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
