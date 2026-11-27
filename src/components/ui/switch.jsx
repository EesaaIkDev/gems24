import * as React from "react"

import { Switch as GlassSwitch } from "@/components/liquid-glass/controls/Switch"

// Radix-style API (checked / onCheckedChange) on top of the liquid-glass switch.
// Extra DOM props (aria-*, data-*) land on the wrapper; `name` goes to the control.
const Switch = React.forwardRef(({ className, checked, onCheckedChange, disabled, name, ...props }, ref) => (
  <span ref={ref} className={className} {...props}>
    <GlassSwitch
      checked={checked}
      onChange={onCheckedChange}
      disabled={disabled}
      name={name}
      size="md"
    />
  </span>
))
Switch.displayName = "Switch"

export { Switch }
