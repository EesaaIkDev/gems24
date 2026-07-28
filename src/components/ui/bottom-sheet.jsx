import React from "react";
import { Drawer } from "vaul";
import { cn } from "@/lib/utils";

/** Native-feeling bottom sheet with an iOS grabber and safe-area padding. */
export default function BottomSheet({ open, onOpenChange, title, description, children, className }) {
  return (
    <Drawer.Root open={open} onOpenChange={onOpenChange} shouldScaleBackground>
      <Drawer.Portal>
        <Drawer.Overlay className="fixed inset-0 z-50 bg-black/45" />
        <Drawer.Content
          className={cn(
            "fixed bottom-0 inset-x-0 z-50 mt-24 flex max-h-[92vh] flex-col rounded-t-3xl border-t border-border bg-card outline-none",
            className
          )}
        >
          <div className="mx-auto mt-2.5 h-1.5 w-10 shrink-0 rounded-full bg-muted-foreground/30" aria-hidden="true" />
          {(title || description) && (
            <div className="px-5 pt-3 text-center">
              {title && <Drawer.Title className="text-base font-semibold">{title}</Drawer.Title>}
              {description && (
                <Drawer.Description className="mt-1 text-sm text-muted-foreground">{description}</Drawer.Description>
              )}
            </div>
          )}
          <div
            className="app-scroll px-5 pt-4"
            style={{ paddingBottom: "calc(var(--safe-bottom) + 1.25rem)" }}
          >
            {children}
          </div>
        </Drawer.Content>
      </Drawer.Portal>
    </Drawer.Root>
  );
}