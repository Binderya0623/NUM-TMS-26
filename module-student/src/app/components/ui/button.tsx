import * as React from "react"
import { Slot } from "@radix-ui/react-slot"
import { cva, type VariantProps } from "class-variance-authority"
import { cn } from "@/lib/utils"

const buttonVariants = cva(
  [
    "inline-flex items-center justify-center gap-2 whitespace-nowrap",
    "text-sm font-medium tracking-normal rounded-md",
    "transition-[background-color,border-color,color,box-shadow,transform] duration-200",
    "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent/25 focus-visible:ring-offset-2 focus-visible:ring-offset-surface",
    "disabled:pointer-events-none disabled:opacity-40",
  ].join(" "),
  {
    variants: {
      variant: {
        // Solid accent — the single primary action
        default:
          "bg-linear-to-b from-[#2a5f95] to-accent text-white shadow-[0_1px_2px_rgba(16,32,51,0.12)] hover:from-[#326ba4] hover:to-accent-hover hover:shadow-[0_3px_8px_rgba(16,32,51,0.14)]",
        // Outline — neutral, secondary actions
        outline:
          "border border-border-strong bg-linear-to-b from-surface to-accent-softer text-ink-800 shadow-[0_1px_2px_rgba(16,32,51,0.06)] hover:border-accent hover:text-ink-900 hover:shadow-[0_2px_6px_rgba(16,32,51,0.08)]",
        // Ghost — tertiary / icon buttons
        ghost:
          "text-ink-700 hover:bg-accent-softer hover:text-ink-900",
        // Secondary — subtle filled
        secondary:
          "bg-linear-to-b from-accent-softer to-ink-100 text-ink-900 border border-border shadow-[0_1px_2px_rgba(16,32,51,0.06)] hover:border-border-strong hover:bg-accent-soft",
        // Destructive — still monochrome; escalated via border weight
        destructive:
          "border border-border-strong bg-surface text-ink-900 shadow-[0_1px_2px_rgba(16,32,51,0.06)] hover:border-[var(--color-dot-negative)] hover:text-[var(--color-dot-negative)]",
        // Link — inline text
        link:
          "text-ink-900 underline-offset-4 hover:underline px-0",
      },
      size: {
        default: "h-9 px-4",
        sm: "h-8 px-3 text-xs",
        lg: "h-11 px-6 text-sm",
        icon: "h-9 w-9 p-0",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "default",
    },
  }
)

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof buttonVariants> {
  asChild?: boolean
}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant, size, asChild = false, ...props }, ref) => {
    const Comp = asChild ? Slot : "button"
    return (
      <Comp
        className={cn(buttonVariants({ variant, size, className }))}
        ref={ref}
        {...props}
      />
    )
  }
)
Button.displayName = "Button"

export { Button, buttonVariants }
