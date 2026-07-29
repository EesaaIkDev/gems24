import React from "react";
import { Button } from "@/components/ui/button";
import { ArrowLeft } from "lucide-react";

/** One screen of the guided create-a-listing flow. */
export default function StepShell({ step, total, title, hint, onBack, onNext, nextLabel = "Next", nextDisabled, children }) {
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
        <div className="flex-1 flex gap-1.5">
          {Array.from({ length: total }).map((_, i) => (
            <span
              key={i}
              className={`h-1 flex-1 rounded-full ${i <= step ? "bg-primary" : "bg-secondary"}`}
            />
          ))}
        </div>
        <span className="text-xs text-muted-foreground tabular-nums">
          {step + 1}/{total}
        </span>
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