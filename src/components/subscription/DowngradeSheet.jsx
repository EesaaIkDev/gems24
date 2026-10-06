import React, { useEffect, useState } from "react";
import { Loader2 } from "lucide-react";
import BottomSheet from "@/components/ui/bottom-sheet";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Image } from "@/components/ui/image";
import { base44 } from "@/api/base44Client";
import { removeRow } from "@/lib/localdb";
import { launchPaywall } from "@/lib/revenuecat";
import { isNative, haptic } from "@/lib/despia";
import { TIERS, cap } from "@/lib/gems";
import { effectiveLimit } from "@/lib/referral";
import { renewalLabel } from "@/lib/plan";

/**
 * Moving to a lower grade. The switch lands at the end of the plan year, but
 * the trader has to get down to the lower grade's listing limit first — they
 * pick which stones go. Upgrades never come through here.
 *
 * `scheduled` means the downgrade is already booked in the store (e.g. made
 * from the phone's subscription settings) and only the trim is left to do.
 */
export default function DowngradeSheet({ trader, tier, listings, scheduled = false, onClose, onChanged }) {
  const [selected, setSelected] = useState([]);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => setSelected([]), [tier]);

  if (!tier) return null;
  const current = TIERS[trader.subscription_tier || "none"].label;
  const next = TIERS[tier].label;
  const limit = effectiveLimit(trader, tier);
  const excess = Math.max(0, listings.length - limit);
  const when = renewalLabel(trader);

  const toggle = (id) =>
    setSelected((s) => (s.includes(id) ? s.filter((x) => x !== id) : [...s, id]));

  const removeSelected = async () => {
    setBusy(true);
    setError("");
    try {
      await Promise.all(selected.map((id) => base44.entities.Listing.delete(id)));
      await Promise.all(selected.map((id) => removeRow("Listing", id)));
      haptic("light");
      setSelected([]);
      await onChanged?.();
    } catch {
      setError("Some listings couldn't be deleted. Check your connection and try again.");
    } finally {
      setBusy(false);
    }
  };

  const continueToStore = () => {
    haptic("light");
    launchPaywall(tier, trader.id);
    onClose();
  };

  return (
    <BottomSheet open={!!tier} onOpenChange={(o) => !o && onClose()} title={`Switch to ${next}`}>
      <div className="mx-auto max-w-md space-y-4 pb-2">
        <p className="text-sm leading-relaxed text-muted-foreground">
          Your switch to {next} takes effect on <span className="font-semibold text-foreground">{when}</span>. You
          keep {current} and all its listing slots until then. Nothing is charged or refunded today — {next} is
          billed at your renewal.
        </p>

        {excess > 0 ? (
          <>
            <div className="rounded-2xl bg-secondary/70 p-4">
              <p className="text-sm font-semibold">
                Delete {excess} {excess === 1 ? "listing" : "listings"} to continue
              </p>
              <p className="mt-1 text-xs leading-relaxed text-muted-foreground">
                {next} allows {limit} active {limit === 1 ? "listing" : "listings"} and you have {listings.length}.
                Choose which ones to remove — deleted listings can't be recovered.
              </p>
            </div>
            <ul className="space-y-2">
              {listings.map((l) => (
                <li key={l.id}>
                  <label className="flex cursor-pointer items-center gap-3 rounded-xl border border-border p-2.5">
                    <Checkbox checked={selected.includes(l.id)} onCheckedChange={() => toggle(l.id)} />
                    <div className="h-11 w-11 shrink-0 overflow-hidden rounded-lg bg-secondary">
                      {l.photos?.[0] && <Image src={l.photos[0]} alt="" className="h-full w-full" />}
                    </div>
                    <div className="min-w-0">
                      <p className="truncate text-sm font-medium">
                        {l.weight_carats} ct {cap(l.gemstone_type)}
                      </p>
                      <p className="truncate text-xs text-muted-foreground">
                        {[cap(l.treatment), l.color, cap(l.status)].filter(Boolean).join(" · ")}
                      </p>
                    </div>
                  </label>
                </li>
              ))}
            </ul>
            {error && <p className="text-sm text-destructive">{error}</p>}
            <Button
              variant="destructive"
              className="w-full"
              disabled={busy || selected.length < excess}
              onClick={removeSelected}
            >
              {busy && <Loader2 className="h-4 w-4 animate-spin" />}
              {selected.length < excess
                ? `Select ${excess - selected.length} more`
                : `Delete ${selected.length} ${selected.length === 1 ? "listing" : "listings"}`}
            </Button>
          </>
        ) : scheduled ? (
          <>
            <p className="text-sm leading-relaxed">You're within {next}'s limit — nothing else to do.</p>
            <Button className="w-full" onClick={onClose}>
              Done
            </Button>
          </>
        ) : (
          <>
            <Button className="w-full" onClick={continueToStore} disabled={!isNative}>
              {isNative ? "Continue to app store" : "Open the Gems24 app to switch"}
            </Button>
            <p className="text-center text-xs leading-relaxed text-muted-foreground">
              Confirm the switch on the next screen. You can cancel it any time before {when} from Manage
              subscription.
            </p>
          </>
        )}
      </div>
    </BottomSheet>
  );
}
