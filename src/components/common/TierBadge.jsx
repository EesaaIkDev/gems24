import React from "react";
import { TIERS } from "@/lib/gems";

const emblems = {
  platinum: ["M4 1.5h8L15 5v6l-3 3.5H4L1 11V5z", "M4 1.5 5.5 5h5L12 1.5M1 5l4.5 1v4L1 11m14-6-4.5 1v4l4.5 1M4 14.5 5.5 11h5l1.5 3.5"],
  gold: ["M4 2h8l3 4-7 8-7-8z", "M1 6h14M4 2l2 4 2 8 2-8 2-4"],
  silver: ["M8 1.5 14.5 8 8 14.5 1.5 8z", "M8 1.5 5 8l3 6.5L11 8 8 1.5M1.5 8h13"],
  bronze: ["M5 2h6l3 3v6l-3 3H5l-3-3V5z", "M5 2v3l-3 3 3 3v3m6-12v3l3 3-3 3v3M5 5h6v6H5z"],
  none: ["M8 2 13.5 6v4L8 14l-5.5-4V6z", "m2.5 6 5.5 3 5.5-3M8 9v5"],
};

export default function TierBadge({ tier = "none", className = "" }) {
  const grade = tier || "none";
  if (!Object.hasOwn(emblems, grade)) return null;
  const [outline, facets] = emblems[grade];
  return (
    <span data-membership={grade} className={`membership-emblem inline-flex shrink-0 items-center gap-1 whitespace-nowrap text-[11px] font-semibold leading-tight ${className}`}>
      <svg viewBox="0 0 16 16" aria-hidden="true" className="h-3.5 w-3.5 shrink-0" fill="none" stroke="currentColor" strokeWidth="1.1" strokeLinejoin="round">
        <path d={outline} fill="currentColor" fillOpacity=".09" />
        <path d={facets} strokeOpacity=".72" />
      </svg>
      {TIERS[grade].label}
    </span>
  );
}