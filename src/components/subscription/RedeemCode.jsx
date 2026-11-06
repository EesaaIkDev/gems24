import React, { useState } from "react";
import { base44 } from "@/api/base44Client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { TIERS } from "@/lib/gems";
import useErrorHaptic from "@/hooks/useErrorHaptic";

// Web-only free-access codes, validated and applied on the server.
export default function RedeemCode({ tier, onGranted }) {
  const [code, setCode] = useState("");
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);
  useErrorHaptic(error);

  const apply = async () => {
    const value = code.trim().toUpperCase();
    if (value.length !== 6) return setError("Codes are 6 characters long.");
    setBusy(true);
    setError("");
    const { data } = await base44.functions.invoke("redeemDiscountCode", { code: value, tier });
    setBusy(false);
    if (data?.state === "granted") return onGranted();
    if (data?.state === "wrong_tier") return setError(`That code can't be used for the ${TIERS[tier].label} grade.`);
    setError(data?.reason || "That code isn't valid.");
  };

  return (
    <div className="space-y-2">
      <p className="text-xs font-semibold text-muted-foreground">Have an access code?</p>
      <div className="flex gap-2">
        <Input
          value={code}
          onChange={(e) => setCode(e.target.value.toUpperCase().slice(0, 6))}
          placeholder="Access code"
          maxLength={6}
          autoCapitalize="characters"
          className="h-11 text-center font-heading tracking-[0.3em]"
        />
        <Button variant="outline" className="h-11 shrink-0" onClick={apply} disabled={busy}>
          {busy ? "Checking…" : "Apply"}
        </Button>
      </div>
      {error && <p className="text-center text-xs text-destructive">{error}</p>}
    </div>
  );
}