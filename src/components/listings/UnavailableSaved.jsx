import React from "react";
import { Gem } from "lucide-react";
import { Button } from "@/components/ui/button";

/** Saved gemstones whose listing was deleted or is no longer visible. */
export default function UnavailableSaved({ items, onRemove }) {
  return (
    <section>
      <h2 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">No longer available</h2>
      <div className="mt-2 divide-y divide-border overflow-hidden rounded-xl border border-border bg-card">
        {items.map((s) => (
          <div key={s.id} className="flex items-center gap-3 px-3.5 py-3">
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-secondary">
              <Gem className="h-4 w-4 text-muted-foreground/60" />
            </div>
            <div className="min-w-0 flex-1">
              <p className="truncate text-sm font-medium">{s.label || "Gemstone listing"}</p>
              <p className="text-xs text-muted-foreground">Removed by the seller</p>
            </div>
            <Button size="sm" variant="secondary" onClick={() => onRemove(s)}>Remove</Button>
          </div>
        ))}
      </div>
    </section>
  );
}