import * as React from "react"

import { cn } from "@/lib/utils"

const Textarea = React.forwardRef(({ className, ...props }, ref) => {
  return (
    (<textarea
      className={cn(
        "flex min-h-[60px] w-full rounded-xl border border-white/50 bg-white/55 px-3.5 py-2.5 text-base shadow-sm backdrop-blur-md placeholder:text-muted-foreground dark:border-white/15 dark:bg-white/5 focus-visible:border-primary focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-primary focus-visible:ring-offset-0 disabled:cursor-not-allowed disabled:bg-secondary disabled:text-disabled md:text-[15px]",
        className
      )}
      ref={ref}
      {...props} />)
  );
})
Textarea.displayName = "Textarea"

export { Textarea }