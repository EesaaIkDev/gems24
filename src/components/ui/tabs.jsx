import * as React from "react"
import * as TabsPrimitive from "@radix-ui/react-tabs"

import { GlassLayer } from "@/components/liquid-glass/glass-layer"
import { GlassLens } from "@/components/liquid-glass/glass-lens"
import { cn } from "@/lib/utils"

const TabsContext = React.createContext(null)

/** Segmented control: a frosted glass track whose emerald lens travels as clear glass. */
const Tabs = React.forwardRef(({ value, defaultValue, onValueChange, ...props }, ref) => {
  const [inner, setInner] = React.useState(defaultValue)
  const current = value !== undefined ? value : inner
  const change = (next) => {
    setInner(next)
    onValueChange?.(next)
  }
  return (
    <TabsContext.Provider value={current}>
      <TabsPrimitive.Root ref={ref} value={current} onValueChange={change} {...props} />
    </TabsContext.Provider>
  )
})
Tabs.displayName = TabsPrimitive.Root.displayName

const TabsList = React.forwardRef(({ className, children, ...props }, ref) => {
  const current = React.useContext(TabsContext)

  return (
    <TabsPrimitive.List
      data-glass-host=""
      ref={ref}
      className={cn(
        "glass-frost relative inline-flex h-12 items-center justify-center rounded-full p-1 text-muted-foreground",
        className
      )}
      {...props}>
      <GlassLayer material="tinted" tint={0.4} swell={false} />
      <GlassLens value={current} />
      {children}
    </TabsPrimitive.List>
  )
})
TabsList.displayName = TabsPrimitive.List.displayName

const TabsTrigger = React.forwardRef(({ className, value, ...props }, ref) => {
  const current = React.useContext(TabsContext)
  const selected = value === current
  return (
    <TabsPrimitive.Trigger
      ref={ref}
      value={value}
      className={cn(
        "relative inline-flex h-full items-center justify-center whitespace-nowrap rounded-full px-3 text-sm font-semibold ring-offset-background transition-colors duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 data-[state=active]:text-primary-foreground dark:data-[state=active]:text-accent-foreground [[data-glass-traveling]_&]:text-muted-foreground",
        className
      )}
      {...props}>
      {selected && (
        <span
          aria-hidden="true"
          data-glass-highlight=""
          className="glass-emerald pointer-events-none absolute inset-0 rounded-full dark:border-border dark:bg-popover [[data-glass-moving]_&]:opacity-0"
        />
      )}
      <span className="relative z-20">{props.children}</span>
    </TabsPrimitive.Trigger>
  )
})
TabsTrigger.displayName = TabsPrimitive.Trigger.displayName

const TabsContent = React.forwardRef(({ className, ...props }, ref) => (
  <TabsPrimitive.Content
    ref={ref}
    className={cn(
      "mt-2 ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2",
      className
    )}
    {...props} />
))
TabsContent.displayName = TabsPrimitive.Content.displayName

export { Tabs, TabsList, TabsTrigger, TabsContent }