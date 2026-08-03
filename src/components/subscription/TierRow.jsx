import React from "react";
import { Button } from "@/components/ui/button";
import { Check } from "lucide-react";
import { TIERS, TIER_STYLES } from "@/lib/gems";

/**
 * A subscription tier presented like a gemstone grade card: the same tier badge
 * traders see across the app, its listing capacity as a filled carat meter, and
 * the placement it buys — no generic feature checklist.
 */
export default function TierRow({ tier, capacity, placement, current, recommended, onSelect }) {
  const t = TIERS[tier];
  const filled = t.limit === Infinity ? 5 : Math.max(1, Math.round((t.limit / 30) * 4));

  return (
    <div className={`gem-corners gem-card gem-frame ${recommended ? "gem-frame-primary" : ""}`}>
      <div className="gem-corners gem-card bg-card px-4 py-4">
        <div className="flex items-center gap-2.5">
          <span
            className={`rounded-full border px-2.5 py-1 text-[0.6875rem] font-bold uppercase tracking-wider ${TIER_STYLES[tier]}`}
          >
            {t.label}
          </span>
          {recommended && (
            <span className="text-[0.625rem] font-bold uppercase tracking-wider text-primary">
              Most traded
            </span>
          )}
          {current && (
            <span className="ml-auto inline-flex items-center gap-1 text-[0.6875rem] font-semibold text-primary">
              <Check className="h-3.5 w-3.5" /> Active
            </span>
          )}
        </div>

        <div className="mt-3 flex items-end justify-between gap-3">
          <div>
            <p className="font-heading text-2xl font-bold leading-none">
              ${t.price}
              <span className="ml-1 text-xs font-medium text-muted-foreground">/ month</span>
            </p>
            <p className="mt-1.5 text-[0.8125rem] text-muted-foreground">{capacity}</p>
          </div>
          <div className="flex items-end gap-1 pb-1" aria-hidden="true">
            {[0, 1, 2, 3, 4].map((i) => (
              <span
                key={i}
                className={`w-2 rounded-full ${i < filled ? "bg-primary" : "bg-secondary"}`}
                style={{ height: `${0.5 + i * 0.25}rem` }}
              />
            ))}
          </div>
        </div>

        <p className="mt-3 border-t border-border pt-3 text-[0.8125rem] leading-relaxed text-foreground/80">
          {placement}
        </p>

        <Button
          className="mt-4 w-full"

          disabled={current}
          onClick={() => onSelect(tier)}
        >
          {current ? "Current plan" : `Trade on ${t.label}`}
        </Button>
      </div>
    </div>
  );
}