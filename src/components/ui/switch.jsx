import * as React from "react"
import * as SwitchPrimitives from "@radix-ui/react-switch"

import { cn } from "@/lib/utils"

const Switch = React.forwardRef(({ className, ...props }, ref) => (
  <SwitchPrimitives.Root
    className={cn(
      "neu-inset peer relative inline-flex h-6 w-11 shrink-0 cursor-pointer touch-manipulation items-center rounded-full border-0 bg-background px-0.5 transition-colors duration-200 ease-out before:absolute before:-inset-y-2.5 before:-inset-x-1 before:content-[''] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background disabled:cursor-not-allowed disabled:opacity-50",
      className
    )}
    {...props}
    ref={ref}>
    <SwitchPrimitives.Thumb
      className={cn(
        "neu-raised-sm pointer-events-none block h-5 w-5 rounded-full bg-background ring-0 transition-[transform,background-color] duration-200 ease-out will-change-transform motion-reduce:transition-none data-[state=checked]:translate-x-5 data-[state=unchecked]:translate-x-0 data-[state=checked]:bg-primary"
      )} />
  </SwitchPrimitives.Root>
))
Switch.displayName = SwitchPrimitives.Root.displayName

export { Switch }