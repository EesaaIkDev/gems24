import React from "react";
import { Building2 } from "lucide-react";

/** Marks a business account wherever a trader is shown. */
export default function BusinessTag({ className = "" }) {
  return (
    <span
      className={`inline-flex items-center gap-1 rounded-lg bg-primary/10 px-2 py-0.5 text-[0.6875rem] font-semibold uppercase tracking-wide text-primary ${className}`}
    >
      <Building2 className="h-3 w-3" /> Business
    </span>
  );
}
