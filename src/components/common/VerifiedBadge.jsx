import React from "react";
import { BadgeCheck } from "lucide-react";

export default function VerifiedBadge({ verified, showLabel = false }) {
  if (!verified) return null;
  return (
    <span className="inline-flex items-center gap-1 text-primary text-xs font-semibold">
      <BadgeCheck className="w-4 h-4" />
      {showLabel && "Verified"}
    </span>
  );
}