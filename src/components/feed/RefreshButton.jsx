import React from "react";
import { RefreshCw } from "lucide-react";
import { haptic } from "@/lib/despia";

/** Manual feed refresh with a tap-confirming haptic. */
export default function RefreshButton({ onRefresh }) {
  const run = () => {
    haptic("light");
    onRefresh?.();
  };

  return (
    <button
      onClick={run}
      aria-label="Refresh feed"
      className="neu-raised-sm tap-scale flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-background text-primary"
    >
      <RefreshCw className="h-[18px] w-[18px]" />
    </button>
  );
}