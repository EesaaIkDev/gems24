import React, { useState } from "react";
import { base44 } from "@/api/base44Client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { TIERS } from "@/lib/gems";
import { haptic } from "@/lib/despia";

// Codes are validated and applied entirely on the server (redeemDiscountCode):
// the client never reads a DiscountCode row or writes a grade itself.
export default function RedeemCode({ tier, trader, onGranted, onDiscount, discount }) {
  const [code, setCode] = useState("");
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);

  const apply = async () => {
    const value = code.trim().toUpperCase();
    if (value.length !== 6) {
      setError("Codes are 6 characters long.");
      return;
    }
    setBusy(true);
    setError("");
    const { data } = await base44.functions.invoke("redeemDiscountCode", { code: value, tier });
    setBusy(false);

    if (data?.state === "granted") {
      haptic("light");
      onGranted();
      return;
    }
    if (data?.state === "discount") {
      haptic("light");
      onDiscount({ code: value, percent_off: data.percentOff });
      return;
    }
    if (data?.state === "wrong_tier") {
      setError(`That code can't be used for the ${TIERS[tier].label} grade.`);
      return;
    }
    setError(data?.reason || "That code isn't valid.");
  };

  if (discount) {
    return (
      <p className="text-center text-xs font-semibold text-primary">
        Valid discount code — {discount.percent_off}% off applied at billing
      </p>
    );
  }

  return (
    <div className="space-y-2">
      <div className="flex gap-2">
        <Input
          value={code}
          onChange={(e) => setCode(e.target.value.toUpperCase().slice(0, 6))}
          placeholder="Discount code"
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