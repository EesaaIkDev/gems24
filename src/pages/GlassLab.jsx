import React from "react";
import { Link } from "react-router-dom";
import { ArrowLeft } from "lucide-react";
import useLiquidGlass, { LIQUID_GLASS_INSTALLED, hasWebGL2 } from "@/components/glass-lab/useLiquidGlass";
import GemBackdrop from "@/components/glass-lab/GemBackdrop";
import CssGlassDemo from "@/components/glass-lab/CssGlassDemo";

// Isolated proof of concept for optical Liquid Glass. Not linked from the app.
export default function GlassLab() {
  const lib = useLiquidGlass();
  const webgl = hasWebGL2();

  return (
    <div className="h-full overflow-y-auto bg-background px-4 pb-16 pt-[calc(var(--safe-top)+1rem)]">
      <Link to="/" className="inline-flex items-center gap-1.5 text-sm text-muted-foreground">
        <ArrowLeft className="h-4 w-4" /> Back
      </Link>
      <h1 className="mt-3 text-2xl font-bold">Liquid Glass lab</h1>
      <p className="mt-1 text-sm text-muted-foreground">
        Engine files: {LIQUID_GLASS_INSTALLED ? "installed" : "not installed yet"} · WebGL2: {webgl ? "yes" : "no (CSS fallback)"}
      </p>

      <div className="relative mt-5">
        <GemBackdrop />
        <div className="absolute inset-x-3 top-6 space-y-3">
          <CssGlassDemo />
          {lib && (
            <lib.GlassCard live className="p-5">
              <p className="font-heading text-base font-semibold">Optical glass</p>
              <p className="mt-1 text-sm">WebGL2 refraction from the original engine.</p>
            </lib.GlassCard>
          )}
        </div>
        {lib && <lib.GlassBadge className="absolute -right-1 -top-2 bg-primary text-primary-foreground">New</lib.GlassBadge>}
      </div>

      {lib && (
        <div className="mt-6">
          <lib.GlassSlideToConfirm fillClassName="bg-primary text-primary-foreground" resetAfter={1500} onConfirm={() => new Promise((r) => setTimeout(r, 900))}>
            Slide to confirm
          </lib.GlassSlideToConfirm>
        </div>
      )}
      {!LIQUID_GLASS_INSTALLED && (
        <p className="mt-6 rounded-lg border border-border bg-card p-4 text-sm text-muted-foreground">
          Add the original src/components/liquid-glass/ folder to switch on the optical versions here.
        </p>
      )}
    </div>
  );
}