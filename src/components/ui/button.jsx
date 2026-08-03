import * as React from "react"
import { Slot } from "@radix-ui/react-slot"
import { cva } from "class-variance-authority";

import { cn } from "@/lib/utils"

const buttonVariants = cva(
  "gem-corners gem-btn font-heading inline-flex items-center justify-center gap-2 whitespace-nowrap text-sm font-semibold focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:pointer-events-none disabled:opacity-50 [&_svg]:pointer-events-none [&_svg]:size-4 [&_svg]:shrink-0",
  {
    variants: {
      variant: {
        default:
          "gem-btn-raised bg-primary text-primary-foreground hover:brightness-105",
        destructive:
          "gem-btn-raised-destructive bg-destructive text-destructive-foreground hover:brightness-105",
        outline:
          "gem-btn-raised-outline bg-secondary text-foreground [text-shadow:0_1px_0_rgba(255,255,255,0.8)] hover:brightness-[1.02]",
        secondary:
          "gem-btn-raised-outline bg-secondary text-secondary-foreground [text-shadow:0_1px_0_rgba(255,255,255,0.8)] hover:brightness-[1.02]",
        ghost: "gem-flat [&::after]:hidden [&::before]:hidden hover:bg-accent hover:text-accent-foreground",
        link: "gem-flat [&::after]:hidden [&::before]:hidden text-primary underline-offset-4 hover:underline",
      },
      size: {
        default: "h-11 px-5",
        sm: "h-9 px-3.5 text-xs",
        lg: "h-12 px-8 text-[0.9375rem]",
        icon: "h-9 w-9",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "default",
    },
  }
)

const Button = React.forwardRef(({ className, variant, size, asChild = false, ...props }, ref) => {
  const Comp = asChild ? Slot : "button"
  return (
    (<Comp
      className={cn(buttonVariants({ variant, size, className }))}
      ref={ref}
      {...props} />)
  );
})
Button.displayName = "Button"

export { Button, buttonVariants }