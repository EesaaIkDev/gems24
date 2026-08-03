import React from "react";
import { TIER_STYLES, TIERS } from "@/lib/gems";

export default function TierBadge({ tier, className = "" }) {
  if (!tier || tier === "none") return null;
  return (
    <span
      className={`neu-raised-sm inline-flex items-center rounded-full bg-background px-2.5 py-0.5 text-[10px] font-bold uppercase tracking-wider ${TIER_STYLES[tier]} ${className}`}
    >
      {TIERS[tier]?.label}
    </span>
  );
}