import React from "react";
import { Check, Crown } from "lucide-react";
import { Button } from "@/components/ui/button";
import { TIERS, TIER_STYLES } from "@/lib/gems";

export default function TierCard({ tier, features, current, onSelect }) {
  const t = TIERS[tier];
  const highlight = tier === "gold";

  return (
    <div
      className={`relative rounded-3xl border p-5 flex flex-col ${
        highlight ? "border-primary bg-accent/40 shadow-lg shadow-primary/5" : "border-border bg-card"
      }`}
    >
      {highlight && (
        <span           className="absolute -top-2.5 left-5 rounded-full bg-primary px-2.5 py-0.5 text-[0.625rem] font-bold uppercase tracking-wider text-primary-foreground">
          Most popular
        </span>
      )}
      <div className="flex items-center gap-2">
        <span className={`rounded-full border px-2.5 py-1 text-[0.6875rem] font-bold uppercase tracking-wider ${TIER_STYLES[tier]}`}>
          {t.label}
        </span>
        {current && <Crown className="w-4 h-4 text-primary" />}
      </div>
      <div className="mt-4 flex items-baseline gap-1">
        <span className="text-3xl font-bold">${t.price}</span>
        <span className="text-sm text-muted-foreground">/ month</span>
      </div>
      <p className="mt-1 text-xs text-muted-foreground">
        {t.limit === Infinity ? "Unlimited active listings" : `Up to ${t.limit} active listings`}
      </p>
      <ul className="mt-4 space-y-2 flex-1">
        {features.map((f) => (
          <li key={f} className="flex gap-2 text-sm text-foreground/85">
            <Check className="w-4 h-4 text-primary shrink-0 mt-0.5" />
            {f}
          </li>
        ))}
      </ul>
      <Button
        className="mt-5 w-full h-11 font-semibold"
        variant={highlight ? "default" : "outline"}
        disabled={current}
        onClick={() => onSelect(tier)}
      >
        {current ? "Current plan" : `Choose ${t.label}`}
      </Button>
    </div>
  );
}