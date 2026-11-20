import React from "react";
import { TIER_STYLES, TIERS } from "@/lib/gems";

export default function TierBadge({ tier, className = "" }) {
  if (!tier || tier === "none") return null;
  return (
    <span
      className={`inline-flex items-center rounded-full border px-2 py-0.5 text-[11px] font-semibold uppercase tracking-wide ${TIER_STYLES[tier]} ${className}`}
    >
      {TIERS[tier]?.label}
    </span>
  );
}