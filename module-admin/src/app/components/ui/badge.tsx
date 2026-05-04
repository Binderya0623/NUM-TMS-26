import * as React from "react"
import { cva, type VariantProps } from "class-variance-authority"

import { cn } from "@/lib/utils"

const badgeVariants = cva(
  [
    "inline-flex items-center rounded-sm",
    "px-2 py-0.5 text-[11px] font-medium tracking-wide uppercase",
    "border transition-colors",
  ].join(" "),
  {
    variants: {
      variant: {
        // Solid accent for emphasis (use sparingly)
        default:
          "border-ink-900 bg-ink-900 text-white",
        // Outline accent — high emphasis but neutral
        outline:
          "border-ink-900 text-ink-900 bg-transparent",
        // Secondary — low emphasis, subtle
        secondary:
          "border-border-strong text-ink-600 bg-transparent",
        // Destructive kept monochrome
        destructive:
          "border-ink-900 text-ink-900 bg-transparent",
        // Soft — background-only subtle fill
        soft:
          "border-transparent bg-ink-100 text-ink-700",
      },
    },
    defaultVariants: {
      variant: "secondary",
    },
  }
)

export interface BadgeProps
  extends React.HTMLAttributes<HTMLDivElement>,
    VariantProps<typeof badgeVariants> {}

function Badge({ className, variant, ...props }: BadgeProps) {
  return (
    <div className={cn(badgeVariants({ variant }), className)} {...props} />
  )
}

export { Badge, badgeVariants }
