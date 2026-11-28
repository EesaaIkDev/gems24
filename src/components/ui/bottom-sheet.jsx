import React, { useState } from "react";
import { Drawer } from "vaul";
import { cn } from "@/lib/utils";
import { X } from "lucide-react";

/** Native-feeling bottom sheet with iOS grabber, safe-area padding, and sticky footer. */
export default function BottomSheet({ open, onOpenChange, title, description, children, footer, className }) {
  const [snap, setSnap] = useState(0.85);
  return (
    <Drawer.Root open={open} onOpenChange={(value) => { setSnap(0.85); onOpenChange(value); }} snapPoints={[0.5, 0.85]} activeSnapPoint={snap} setActiveSnapPoint={setSnap} fadeFromIndex={0} handleOnly>
      <Drawer.Portal>
        <Drawer.Overlay className="fixed inset-0 z-50 bg-black/40" />
        <Drawer.Content
          className={cn(
            "fixed bottom-0 inset-x-0 z-50 flex flex-col rounded-t-2xl border-t border-border bg-background shadow-float outline-none dark:bg-popover",
            className
          )}
          style={{ height: "100dvh", paddingBottom: `calc(100dvh * (1 - ${snap || 0.85}))` }}
        >
          <Drawer.Handle aria-label="Drag to resize or close" className="mx-auto mt-4 mb-1 h-1 w-10 shrink-0 rounded-full bg-border" />
          <div className="flex items-center justify-between px-5 pt-3 pb-2 border-b border-border">
            <div className="text-center flex-1">
              {title && <Drawer.Title className="text-lg font-semibold">{title}</Drawer.Title>}
              {description && (
                <Drawer.Description className="mt-1 text-sm text-muted-foreground">{description}</Drawer.Description>
              )}
            </div>
            <button
              type="button"
              onClick={() => onOpenChange(false)}
              className="shrink-0 p-1 -mr-1 text-muted-foreground hover:text-foreground transition-colors"
              aria-label="Close"
            >
              <X className="h-5 w-5" />
            </button>
          </div>
          <div className="flex-1 overflow-y-auto app-scroll px-5 pt-4 pb-4">
            {children}
          </div>
          {footer && (
            <div className="px-5 pt-3 pb-6 border-t border-border bg-background dark:bg-popover">
              {footer}
            </div>
          )}
        </Drawer.Content>
      </Drawer.Portal>
    </Drawer.Root>
  );
}