import React from "react";
import { Button } from "@/components/ui/button";
import { ArrowLeft } from "lucide-react";

/**
 * One screen of the guided create-a-listing flow.
 * The meter never opens at zero: opening the flow already counts as progress,
 * and the current step fills as soon as its required fields are in — so the bar
 * visibly advances on the very first screen.
 */
export default function StepShell({ step, total, title, hint, onBack, onNext, nextLabel = "Next", nextDisabled, children }) {
  const stepsDone = step + (nextDisabled ? 0 : 1);
  const percent = Math.round(15 + (85 * stepsDone) / total);

  return (
    <div className="flex flex-col min-h-full px-4 pt-4 pb-8 max-w-lg mx-auto">
      <div className="flex items-center gap-3">
        <button
          type="button"
          onClick={onBack}
          className="flex h-9 w-9 items-center justify-center rounded-full hover:bg-secondary"
          aria-label="Back"
        >
          <ArrowLeft className="w-4 h-4" />
        </button>
        <div className="neu-inset-sm h-1.5 flex-1 overflow-hidden rounded-full bg-background">
          <div
            className="h-full rounded-full bg-primary transition-all duration-500"
            style={{ width: `${percent}%` }}
          />
        </div>
        <span className="text-xs text-muted-foreground tabular-nums">{percent}%</span>
      </div>

      <h1 className="mt-5 text-[1.5rem] font-bold leading-tight">{title}</h1>
      {hint && <p className="mt-1.5 text-sm text-muted-foreground">{hint}</p>}

      <div className="mt-5 space-y-4 flex-1">{children}</div>

      <Button onClick={onNext} disabled={nextDisabled} className="mt-6 w-full h-12 text-base font-semibold">
        {nextLabel}
      </Button>
    </div>
  );
}