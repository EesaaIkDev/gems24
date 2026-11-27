import * as React from "react"

import { Checkbox as GlassCheckbox } from "@/components/liquid-glass/controls/Checkbox"

const Checkbox = React.forwardRef(({ className, ...props }, ref) => (
  <GlassCheckbox
    ref={ref}
    className={className}
    {...props}
  />
))
Checkbox.displayName = "Checkbox"

export { Checkbox }
