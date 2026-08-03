import React from "react";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { EyeOff } from "lucide-react";
import { TIERS } from "@/lib/gems";

/**
 * Shown when a trader is at (or over) their tier's active-listing capacity.
 * Framed around what the trader loses by staying put, not what a plan adds.
 */
export default function LimitWarning({ tier, active, limit }) {
  const hidden = Math.max(0, active - limit);
  const label = TIERS[tier || "none"].label;

  return (
    <div className="mx-auto max-w-sm px-6 py-16 text-center">
      <div className="neu-raised mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-background">
        <EyeOff className="h-6 w-6 text-destructive" />
      </div>
      <h1 className="mt-5 font-heading text-xl font-bold leading-tight">
        {hidden > 0
          ? `${hidden} of your ${active} stones stay hidden from buyers`
          : "Your next stone won't reach buyers"}
      </h1>
      <p className="mt-3 text-sm leading-relaxed text-muted-foreground">
        {label} shows {limit} {limit === 1 ? "stone" : "stones"} at a time. Every stone beyond that stops
        appearing in search and in traders' feeds — buyers never see it, and the enquiries go to someone else.
      </p>
      <Button asChild className="mt-6 h-12 w-full font-semibold">
        <Link to="/subscription">Keep all my stones visible</Link>
      </Button>
      <Button asChild variant="ghost" className="mt-1 w-full text-muted-foreground">
        <Link to="/profile">Continue with limited visibility</Link>
      </Button>
    </div>
  );
}