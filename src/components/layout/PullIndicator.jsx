import React from "react";
import { Gem } from "lucide-react";

/** The gem that follows your finger down and spins while the app refreshes. */
export default function PullIndicator({ pull, progress, refreshing }) {
  if (!pull && !refreshing) return null;
  const offset = refreshing ? 56 : pull;

  return (
    <div
      className="pointer-events-none absolute inset-x-0 z-30 flex justify-center"
      style={{ top: "calc(var(--safe-top) + var(--header-h))" }}
      aria-hidden="true"
    >
      <div
        className="neu-raised-sm flex h-10 w-10 items-center justify-center rounded-full bg-background"
        style={{
          transform: `translateY(${offset - 44}px)`,
          opacity: refreshing ? 1 : progress,
          transition: refreshing ? "transform 0.2s ease" : "none",
        }}
      >
        <Gem
          className={`h-[18px] w-[18px] text-primary ${refreshing ? "animate-spin" : ""}`}
          style={refreshing ? undefined : { transform: `rotate(${progress * 180}deg)` }}
        />
      </div>
    </div>
  );
}