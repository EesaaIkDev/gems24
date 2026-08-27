import React, { useState } from "react";
import { base44 } from "@/api/base44Client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { TIERS } from "@/lib/gems";
import { haptic } from "@/lib/despia";

// Discount codes are 6 characters, stored uppercase, and each one lists the
// tiers it is valid for. A 100% code grants the grade immediately.
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
    const [found] = await base44.entities.DiscountCode.filter({ code: value });
    setBusy(false);

    if (!found || found.active === false) {
      setError("That code isn't valid.");
      return;
    }
    if (!(found.tiers || []).includes(tier)) {
      setError(`That code can't be used for the ${TIERS[tier].label} grade.`);
      return;
    }

    haptic("light");
    await base44.entities.DiscountCode.update(found.id, { times_used: (found.times_used || 0) + 1 });

    if (found.percent_off >= 100) {
      await base44.entities.Trader.update(trader.id, { subscription_tier: tier });
      onGranted();
      return;
    }
    onDiscount({ code: value, percent_off: found.percent_off });
  };

  if (discount) {
    return (
      <p className="text-center text-xs font-semibold text-primary">
        Code {discount.code} applied — {discount.percent_off}% off
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