import React, { useState } from "react";
import BottomSheet from "@/components/ui/bottom-sheet";
import { Button } from "@/components/ui/button";
import { Settings2 } from "lucide-react";
import TierRow from "@/components/subscription/TierRow";
import Spinner from "@/components/common/Spinner";
import TierBadge from "@/components/common/TierBadge";
import useCurrentTrader from "@/hooks/useCurrentTrader";
import useEntitlements from "@/hooks/useEntitlements";
import { isNative, haptic } from "@/lib/despia";
import { launchPaywall, openCustomerCenter } from "@/lib/revenuecat";
import { LOGO_URL, TIERS, TIER_ORDER } from "@/lib/gems";

const CAPACITY = {
  bronze: "3 stones on the market at once",
  silver: "10 stones on the market at once",
  gold: "30 stones on the market at once",
  platinum: "Unlimited stones on the market",
};

const PLACEMENT = {
  bronze: "A public trader profile with your parcels, open to enquiries from the whole network.",
  silver: "Your Silver badge travels with every stone and lifts you above unranked traders in search.",
  gold: "Gold badge on profile and stones, with priority placement in search and the trader directory.",
  platinum: "Top placement everywhere plus a featured spot on the home feed — the grade buyers look for first.",
};

// Price anchored against a reference a trader actually deals in — the margin on
// a single stone — rather than presented as an isolated monthly number.
const ANCHOR = {
  platinum: "Less than the commission on one fine 5 ct stone.",
  gold: "About the margin on one 2 ct sapphire a month.",
  silver: "Less than a single small stone's margin.",
  bronze: "About the cost of one courier run.",
};

export default function Subscription() {
  const { trader, loading, reload } = useCurrentTrader();
  useEntitlements(trader, reload);
  const [selected, setSelected] = useState(null);

  const subscribe = () => {
    haptic("light");
    launchPaywall(selected, trader.id);
    setSelected(null);
  };

  if (loading) return <Spinner />;

  const tier = trader?.subscription_tier || "none";

  return (
    <div className="px-4 pb-14 pt-8">
      <div className="mx-auto max-w-lg text-center">
        <img src={LOGO_URL} alt="Gems24" className="mx-auto h-16 w-16" />
        <h1 className="mt-5 font-heading text-[1.75rem] font-bold leading-tight">Your trading grade</h1>
        <p className="mx-auto mt-3 max-w-sm text-sm leading-relaxed text-muted-foreground">
          Gems24 grades traders the way the trade grades stones. The higher your grade, the more parcels
          you can list and the earlier buyers see them.
        </p>
        <div className="mt-5 inline-flex items-center gap-2 rounded-full border border-border bg-card px-3 py-1.5">
          <span className="text-xs text-muted-foreground">Current grade</span>
          {tier === "none" ? (
            <span className="text-xs font-semibold">Ungraded</span>
          ) : (
            <TierBadge tier={tier} />
          )}
        </div>
      </div>

      <div className="mx-auto mt-9 grid max-w-lg grid-cols-1 gap-4 sm:max-w-3xl sm:grid-cols-2">
        {TIER_ORDER.map((t) => (
          <TierRow
            key={t}
            tier={t}
            capacity={CAPACITY[t]}
            placement={PLACEMENT[t]}
            anchor={ANCHOR[t]}
            current={tier === t}
            recommended={t === "gold"}
            onSelect={setSelected}
          />
        ))}
      </div>

      {isNative && tier !== "none" && (
        <Button
          variant="outline"
          className="mx-auto mt-8 flex w-full max-w-sm"
          onClick={() => openCustomerCenter(trader.id)}
        >
          <Settings2 className="h-4 w-4" /> Manage subscription
        </Button>
      )}

      <p className="mx-auto mt-8 max-w-sm text-center text-xs leading-relaxed text-muted-foreground">
        Billed through your {isNative ? "app store" : "App Store or Google Play"} account. Cancel anytime.
      </p>

      <BottomSheet
        open={!!selected}
        onOpenChange={(o) => !o && setSelected(null)}
        title={selected ? `${TIERS[selected].label} grade` : ""}
      >
        <div className="mx-auto max-w-md space-y-5 pb-2">
          {selected && (
            <>
              <div className="flex items-baseline justify-between">
                <TierBadge tier={selected} />
                <p className="font-heading text-xl font-bold">
                  ${TIERS[selected].price}
                  <span className="ml-1 text-xs font-medium text-muted-foreground">/ month</span>
                </p>
              </div>
              <p className="text-sm leading-relaxed text-muted-foreground">
                {CAPACITY[selected]}. {PLACEMENT[selected]}
              </p>
              <Button className="w-full" onClick={subscribe}>
                Continue to payment
              </Button>
            </>
          )}
        </div>
      </BottomSheet>
    </div>
  );
}