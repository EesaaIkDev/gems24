import * as React from "react"
import * as TabsPrimitive from "@radix-ui/react-tabs"

import { GlassLayer } from "@/components/liquid-glass/glass-layer"
import { cn } from "@/lib/utils"

const TabsContext = React.createContext(null)

/** Segmented control: a frosted track with an emerald lens that springs to the selected tab. */
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
  const listRef = React.useRef(null)
  const [lens, setLens] = React.useState(null)

  // Follow the active tab; re-measure when the track resizes.
  React.useLayoutEffect(() => {
    const el = listRef.current
    if (!el) return
    const measure = () => {
      const active = el.querySelector('[role="tab"][data-state="active"]')
      setLens(active ? { x: active.offsetLeft, w: active.offsetWidth } : null)
    }
    measure()
    const observer = new ResizeObserver(measure)
    observer.observe(el)
    return () => observer.disconnect()
  }, [current])

  return (
    <TabsPrimitive.List
      data-glass-host=""
      ref={(node) => {
        listRef.current = node
        if (typeof ref === "function") ref(node)
        else if (ref) ref.current = node
      }}
      className={cn(
        "glass-frost relative inline-flex h-12 items-center justify-center rounded-full p-1 text-muted-foreground",
        className
      )}
      {...props}>
      <GlassLayer material="tinted" tint={0.4} swell={false} />
      {lens && (
        <span
          aria-hidden="true"
          className="glass-emerald pointer-events-none absolute inset-y-1 left-0 rounded-full transition-[transform,width] duration-300 ease-[cubic-bezier(0.34,1.3,0.64,1)]"
          style={{ transform: `translateX(${lens.x}px)`, width: lens.w }} />
      )}
      {children}
    </TabsPrimitive.List>
  )
})
TabsList.displayName = TabsPrimitive.List.displayName

const TabsTrigger = React.forwardRef(({ className, ...props }, ref) => (
  <TabsPrimitive.Trigger
    ref={ref}
    className={cn(
      "relative inline-flex h-full items-center justify-center whitespace-nowrap rounded-full px-3 text-sm font-semibold ring-offset-background transition-colors duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 data-[state=active]:text-primary-foreground",
      className
    )}
    {...props} />
))
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