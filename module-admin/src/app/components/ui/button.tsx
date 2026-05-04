import * as React from "react"
import { Slot } from "@radix-ui/react-slot"
import { cva, type VariantProps } from "class-variance-authority"
import { cn } from "@/lib/utils"

const buttonVariants = cva(
  [
    "inline-flex items-center justify-center gap-2 whitespace-nowrap",
    "text-sm font-medium tracking-tight",
    "transition-[background-color,border-color,color] duration-150",
    "focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ink-900 focus-visible:ring-offset-2 focus-visible:ring-offset-white",
    "disabled:pointer-events-none disabled:opacity-40",
  ].join(" "),
  {
    variants: {
      variant: {
        // Solid accent — the single primary action
        default:
          "bg-accent text-white hover:bg-accent-hover rounded-md",
        // Outline — neutral, secondary actions
        outline:
          "border border-border-strong bg-surface text-ink-800 hover:border-ink-900 hover:text-ink-900 rounded-md",
        // Ghost — tertiary / icon buttons
        ghost:
          "text-ink-700 hover:bg-accent-softer hover:text-ink-900 rounded-md",
        // Secondary — subtle filled
        secondary:
          "bg-accent-softer text-ink-900 hover:bg-ink-100 rounded-md",
        // Destructive — still monochrome; escalated via border weight
        destructive:
          "border border-ink-900 bg-surface text-ink-900 hover:bg-ink-900 hover:text-white rounded-md",
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
