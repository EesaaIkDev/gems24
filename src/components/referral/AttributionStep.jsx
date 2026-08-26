import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { getPendingReferralCode } from "@/lib/referral";

/** Optional, skippable onboarding step that captures a referral code. */
export default function AttributionStep({ onDone, saving }) {
  const [code, setCode] = useState(getPendingReferralCode());

  return (
    <div>
      <h1 className="font-heading text-[26px] font-bold leading-tight">How did you hear about us?</h1>
      <p className="mt-1.5 text-sm text-muted-foreground">
        If a trader invited you, enter their referral code so they get credit. Optional — you can skip this.
      </p>
      <div className="mt-6 space-y-1.5">
        <Label htmlFor="referral">Referral code</Label>
        <Input
          id="referral"
          value={code}
          onChange={(e) => setCode(e.target.value.toUpperCase())}
          placeholder="e.g. AB3K7Z"
          className="h-12 tracking-[0.2em]"
          autoCapitalize="characters"
        />
      </div>
      <Button
        className="mt-6 h-12 w-full font-semibold"
        disabled={saving}
        onClick={() => onDone(code.trim())}
      >
        {saving ? "Creating your profile…" : "Finish"}
      </Button>
      <Button variant="ghost" className="mt-1 w-full text-muted-foreground" disabled={saving} onClick={() => onDone("")}>
        Skip
      </Button>
    </div>
  );
}