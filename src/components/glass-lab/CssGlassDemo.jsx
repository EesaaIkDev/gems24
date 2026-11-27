import React from "react";

/** The current CSS glass (kept as the fallback), for side-by-side comparison. */
export default function CssGlassDemo() {
  return (
    <div className="glass-frost rounded-[28px] p-5">
      <p className="font-heading text-base font-semibold">CSS glass (current)</p>
      <p className="mt-1 text-sm text-muted-foreground">Backdrop blur and tint only. No refraction.</p>
    </div>
  );
}