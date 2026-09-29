import React from "react";
import { Gem } from "lucide-react";

const EASE = "cubic-bezier(0.22, 1, 0.36, 1)";

/** The gem that follows your finger down and spins while the app refreshes. */
export default function PullIndicator({ pull, progress, refreshing, dragging }) {
  const visible = pull > 0 || refreshing;
  const scale = 0.6 + 0.4 * progress;

  return (
    <div
      className="pointer-events-none absolute inset-x-0 z-30 flex justify-center"
      style={{ top: "calc(var(--safe-top) + var(--header-h))" }}
      aria-hidden="true"
    >
      <div
        className="neu-raised-sm flex h-10 w-10 items-center justify-center rounded-full bg-background"
        style={{
          transform: `translate3d(0, ${pull - 44}px, 0) scale(${refreshing ? 1 : scale})`,
          opacity: visible ? Math.max(progress, refreshing ? 1 : 0) : 0,
          transition: dragging ? "none" : `transform 0.45s ${EASE}, opacity 0.3s ease`,
          willChange: "transform, opacity",
        }}
      >
        <Gem
          className={`h-[18px] w-[18px] text-primary ${refreshing ? "animate-spin" : ""}`}
          style={refreshing ? { animationDuration: "0.9s" } : { transform: `rotate(${progress * 270}deg)` }}
        />
      </div>
    </div>
  );
}