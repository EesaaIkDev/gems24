import * as React from "react"
import { cva } from "class-variance-authority";
import { Children, cloneElement } from "react";

import { GlassLayer } from "@/components/liquid-glass/glass-layer"
import { cn } from "@/lib/utils"

const buttonVariants = cva(
  "rounded-lg font-heading inline-flex items-center justify-center gap-2 whitespace-nowrap text-[15px] font-semibold transition-[transform,background-color,border-color,opacity] duration-200 active:scale-[0.97] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 [&_svg]:pointer-events-none [&_svg]:size-4 [&_svg]:shrink-0",
  {
    variants: {
      variant: {
        default: "glass-emerald text-primary-foreground hover:opacity-95",
        destructive: "bg-destructive text-destructive-foreground hover:bg-destructive/90",
        outline: "border border-primary bg-background text-primary hover:bg-accent active:bg-accent",
        secondary: "border border-border bg-background text-foreground hover:bg-secondary active:bg-secondary",
        ghost: "text-foreground hover:bg-secondary active:bg-secondary",
        link: "text-primary underline-offset-4 hover:underline",
      },
      size: {
        default: "h-12 px-5",
        sm: "h-10 px-3.5 text-sm",
        lg: "h-12 px-8",
        icon: "h-11 w-11",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "default",
    },
  }
)

// Solid variants get the liquid-glass surface; ghost/link stay plain text buttons.
const GLASS_VARIANTS = new Set(["default", "destructive", "outline", "secondary"])

const Button = React.forwardRef(({ className, variant, size, asChild = false, children, disabled, ...props }, ref) => {
  const effectiveVariant = variant ?? "default"
  const glass = GLASS_VARIANTS.has(effectiveVariant) ? (
    <GlassLayer material="tinted" tint={0.55} disabled={disabled} />
  ) : null
  const classes = cn(buttonVariants({ variant, size, className }))

  if (asChild) {
    const child = Children.only(children)
    return cloneElement(child, {
      ...props,
      ref,
      disabled,
      "data-glass-host": glass ? "" : undefined,
      className: cn(classes, child.props.className),
    }, <>{glass}{child.props.children}</>)
  }

  return (
    (<button
      className={classes}
      ref={ref}
      disabled={disabled}
      data-glass-host={glass ? "" : undefined}
      {...props}>
      {glass}
      {children}
    </button>)
  );
})
Button.displayName = "Button"

export { Button, buttonVariants }
