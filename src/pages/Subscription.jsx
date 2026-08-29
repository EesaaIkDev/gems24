import React, { useEffect, useRef, useState } from "react";
import BottomSheet from "@/components/ui/bottom-sheet";
import { Button } from "@/components/ui/button";
import { Settings2 } from "lucide-react";
import TierRow from "@/components/subscription/TierRow";
import RedeemCode from "@/components/subscription/RedeemCode";
import BuyListings from "@/components/subscription/BuyListings";
import SuccessSplash from "@/components/subscription/SuccessSplash";
import Spinner from "@/components/common/Spinner";
import TierBadge from "@/components/common/TierBadge";
import useCurrentTrader from "@/hooks/useCurrentTrader";
import useEntitlements from "@/hooks/useEntitlements";
import useOnline from "@/hooks/useOnline";
import { isNative, haptic } from "@/lib/despia";
import { launchPaywall, openCustomerCenter } from "@/lib/revenuecat";
import { LOGO_URL, TIERS, TIER_ORDER, tierRank } from "@/lib/gems";

const CAPACITY = {
  bronze: "25 stones on the market at once",
  silver: "40 stones on the market at once",
  gold: "80 stones on the market at once",
  platinum: "300 stones on the market at once",
};

const PLACEMENT = {
  bronze: "A public trader profile with your parcels, open to enquiries from the whole network.",
  silver: "Your Silver badge travels with every stone and lifts you above unranked traders in search.",
  gold: "Gold badge on profile and stones, with priority placement in search and the trader directory.",
  platinum: "Top placement everywhere plus a featured spot on the home feed — the grade buyers look for first.",
};

// Each grade states who it is for, so a trader recognises their own standing.
const AUDIENCE = {
  platinum: "Built for businesses and established firms.",
  gold: "For high-profile traders.",
  silver: "For intermediate traders.",
  bronze: "For traders just starting out.",
};

export default function Subscription() {
  const { trader, loading, reload } = useCurrentTrader();
  useEntitlements(trader, reload);
  const online = useOnline();
  const [selected, setSelected] = useState(null);
  const [discount, setDiscount] = useState(null);
  const [splash, setSplash] = useState(null);
  const lastRank = useRef(null);

  // A completed purchase surfaces as a higher grade coming back from the store.
  useEffect(() => {
    const rank = tierRank(trader?.subscription_tier);
    if (!trader) return;
    if (lastRank.current !== null && rank > lastRank.current) {
      setSplash({
        title: "You're on " + TIERS[trader.subscription_tier].label,
        subtitle: `${CAPACITY[trader.subscription_tier]} — your grade is live across the network.`,
      });
    }
    lastRank.current = rank;
  }, [trader?.subscription_tier, trader]);

  const openTier = (t) => {
    setDiscount(null);
    setSelected(t);
  };

  const closeSheet = () => {
    setSelected(null);
    setDiscount(null);
  };

  const subscribe = () => {
    haptic("light");
    launchPaywall(selected, trader.id);
    closeSheet();
  };

  const onGranted = () => {
    closeSheet();
    reload();
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
            anchor={AUDIENCE[t]}
            current={tier === t}
            recommended={t === "gold"}
            onSelect={openTier}
          />
        ))}
      </div>

      {trader && tier !== "none" && (
        <BuyListings
          trader={trader}
          onPurchased={(n) => {
            reload();
            setSplash({
              title: "Payment complete",
              subtitle: `${n} extra listing slot${n === 1 ? "" : "s"} added to your account — yours to keep.`,
            });
          }}
        />
      )}

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
        All grades are billed annually through your{" "}
        {isNative ? "app store" : "App Store or Google Play"} account. Cancel anytime.
      </p>

      <BottomSheet
        open={!!selected}
        onOpenChange={(o) => !o && closeSheet()}
        title={selected ? `${TIERS[selected].label} grade` : ""}
      >
        <div className="mx-auto max-w-md space-y-5 pb-2">
          {selected && (
            <>
              <div className="flex items-baseline justify-between">
                <TierBadge tier={selected} />
                {/* Annual-only, and the amount is revealed on the billing screen. */}
                <p className="font-heading text-sm font-bold">
                  Annual plan
                  {discount && (
                    <span className="ml-1.5 text-xs font-medium text-primary">
                      {discount.percent_off}% off
                    </span>
                  )}
                </p>
              </div>
              <p className="text-sm leading-relaxed text-muted-foreground">
                {CAPACITY[selected]}. {PLACEMENT[selected]}
              </p>
              <RedeemCode
                tier={selected}
                trader={trader}
                discount={discount}
                onDiscount={setDiscount}
                onGranted={onGranted}
              />
              <Button className="w-full" onClick={subscribe} disabled={!online}>
                {online ? "Continue to billing" : "Unavailable offline"}
              </Button>
              {online && (
                <p className="text-center text-xs text-muted-foreground">
                  Your annual total is shown on the next screen before you confirm.
                </p>
              )}
              {!online && (
                <p className="text-center text-xs text-muted-foreground">
                  Payments need a connection — reconnect to upgrade your grade.
                </p>
              )}
            </>
          )}
        </div>
      </BottomSheet>

      {splash && (
        <SuccessSplash title={splash.title} subtitle={splash.subtitle} onDone={() => setSplash(null)} />
      )}
    </div>
  );
}