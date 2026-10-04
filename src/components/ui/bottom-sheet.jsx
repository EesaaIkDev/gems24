import React from "react";
import { Drawer } from "vaul";
import { cn } from "@/lib/utils";

/** Native-feeling bottom sheet with an iOS grabber and safe-area padding. */
export default function BottomSheet({ open, onOpenChange, title, description, children, className }) {
  return (
    <Drawer.Root open={open} onOpenChange={onOpenChange} snapPoints={[0.55, 0.88]} fadeFromIndex={0} handleOnly>
      <Drawer.Portal>
        <Drawer.Overlay className="fixed inset-0 z-50 bg-black/45" />
        <Drawer.Content
          className={cn(
            "fixed bottom-0 inset-x-0 z-50 flex h-[88dvh] max-h-[88dvh] flex-col rounded-t-3xl border-t border-border bg-card outline-none",
            className
          )}
        >
          <Drawer.Handle aria-label="Drag to resize or close" className="mx-auto mt-4 mb-1 h-1.5 w-10 shrink-0 rounded-full bg-muted-foreground/30" />
          {(title || description) && (
            <div className="px-5 pt-3 text-center">
              {title && <Drawer.Title className="text-base font-semibold">{title}</Drawer.Title>}
              {description && (
                <Drawer.Description className="mt-1 text-sm text-muted-foreground">{description}</Drawer.Description>
              )}
            </div>
          )}
          <div
            className="app-scroll min-h-0 px-5 pt-4"
            style={{ paddingBottom: "calc(var(--safe-bottom) + 1.25rem)" }}
          >
            {children}
          </div>
        </Drawer.Content>
      </Drawer.Portal>
    </Drawer.Root>
  );
}