import * as React from "react"
import { cva } from "class-variance-authority";

import { cn } from "@/lib/utils"

const badgeVariants = cva(
  "inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-semibold backdrop-blur-md transition-colors focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2",
  {
    variants: {
      variant: {
        default:
          "border-transparent bg-primary/85 text-primary-foreground shadow hover:bg-primary",
        secondary:
          "border-transparent bg-white/60 text-foreground shadow-sm backdrop-blur-md hover:bg-white/80",
        destructive:
          "border-transparent bg-destructive/85 text-destructive-foreground shadow hover:bg-destructive",
        outline: "border-white/50 bg-white/40 text-foreground backdrop-blur-md",
      },
    },
    defaultVariants: {
      variant: "default",
    },
  }
)

function Badge({
  className,
  variant,
  ...props
}) {
  return (<div className={cn(badgeVariants({ variant }), className)} {...props} />);
}

export { Badge, badgeVariants }
