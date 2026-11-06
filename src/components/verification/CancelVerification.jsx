import React, { useState } from "react";
import { Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { base44 } from "@/api/base44Client";
import { haptic } from "@/lib/despia";

/** Two-tap cancel for an in-progress verification. */
export default function CancelVerification({ onCancelled, onError }) {
  const [confirming, setConfirming] = useState(false);
  const [busy, setBusy] = useState(false);

  const cancel = async () => {
    setBusy(true);
    haptic("warning");
    try {
      await base44.functions.invoke("cancelVerification", {});
      setConfirming(false);
      await onCancelled?.();
    } catch (err) {
      onError?.(err?.response?.data?.error || "Couldn't cancel verification. Please try again.");
    }
    setBusy(false);
  };

  if (!confirming) {
    return (
      <Button variant="ghost" className="mt-2 h-10 w-full text-xs text-muted-foreground" onClick={() => setConfirming(true)}>
        Cancel verification
      </Button>
    );
  }

  return (
    <div className="mt-3 space-y-2">
      <p className="text-xs text-foreground/80">
        Cancel this verification? It still counts as one of your attempts.
      </p>
      <div className="grid grid-cols-2 gap-2">
        <Button variant="outline" className="h-10 text-xs" onClick={() => setConfirming(false)} disabled={busy}>
          Keep going
        </Button>
        <Button variant="destructive" className="h-10 text-xs" onClick={cancel} disabled={busy}>
          {busy && <Loader2 className="h-3.5 w-3.5 animate-spin" />}
          Yes, cancel
        </Button>
      </div>
    </div>
  );
}