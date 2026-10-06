import React, { useCallback, useEffect, useRef, useState } from "react";
import { Link } from "react-router-dom";
import BottomSheet from "@/components/ui/bottom-sheet";
import { Button } from "@/components/ui/button";
import { CalendarClock, Crown, Settings2, TriangleAlert } from "lucide-react";
import DowngradeSheet from "@/components/subscription/DowngradeSheet";
import { base44 } from "@/api/base44Client";
import { effectiveLimit } from "@/lib/referral";
import { renewalLabel } from "@/lib/plan";
import TierRow from "@/components/subscription/TierRow";
import RedeemCode from "@/components/subscription/RedeemCode";
import BuyListings from "@/components/subscription/BuyListings";
import SuccessSplash from "@/components/subscription/SuccessSplash";
import Spinner from "@/components/common/Spinner";
import EmptyState from "@/components/common/EmptyState";
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
  const [downgrade, setDowngrade] = useState(null);
  const [trimOnly, setTrimOnly] = useState(false);
  const [listings, setListings] = useState([]);
  const lastRank = useRef(null);

  const loadListings = useCallback(async () => {
    if (!trader?.id) return;
    const rows = await base44.entities.Listing.filter({ trader_id: trader.id }, "created_date", 500).catch(() => []);
    setListings(rows.filter((l) => l.status !== "sold"));
  }, [trader?.id]);

  useEffect(() => {
    loadListings();
  }, [loadListings]);

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

  // Lower grades wait for the end of the plan year (and need the listings to
  // fit); higher grades go straight to billing and apply once paid.
  const openTier = (t) => {
    if (tierRank(trader?.subscription_tier) > 0 && tierRank(t) < tierRank(trader.subscription_tier)) {
      setTrimOnly(false);
      return setDowngrade(t);
    }
    setDiscount(null);
    setSelected(t);
  };

  const onListingsChanged = async () => {
    await loadListings();
    await reload();
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

  if (trader?.account_type === "buyer")
    return (
      <EmptyState
        icon={Crown}
        title="Subscriptions are for trader accounts"
        description="Buyer accounts can browse and message traders for free — there's no plan to buy. Switch to a trader account from your profile to start listing."
        action={
          <Button asChild className="h-11 px-6 font-semibold">
            <Link to="/profile">Switch to trader</Link>
          </Button>
        }
      />
    );

  const tier = trader?.subscription_tier || "none";
  const pending = trader?.pending_tier || "";
  const overBy = pending ? Math.max(0, listings.length - effectiveLimit(trader)) : 0;
  const isUpgrade = selected && tierRank(tier) > 0 && tierRank(selected) > tierRank(tier);

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
        {tier !== "none" && !pending && trader?.plan_renews_at && (
          <p className="mt-2 text-xs text-muted-foreground">Renews on {renewalLabel(trader)}</p>
        )}
      </div>

      {pending && (
        <div className="mx-auto mt-6 max-w-lg space-y-3">
          <div className="rounded-2xl border border-border bg-card p-4">
            <div className="flex items-center gap-2">
              <CalendarClock className="h-4 w-4 text-primary" />
              <p className="text-sm font-semibold">
                Switching to {TIERS[pending].label} on {renewalLabel(trader)}
              </p>
            </div>
            <p className="mt-1.5 text-xs leading-relaxed text-muted-foreground">
              You keep {TIERS[tier].label} until then. Changed your mind? Cancel the switch from Manage
              subscription before that date.
            </p>
            {isNative && (
              <Button variant="outline" className="mt-3 w-full" onClick={() => openCustomerCenter(trader.id)}>
                Keep {TIERS[tier].label}
              </Button>
            )}
          </div>
          {overBy > 0 && (
            <div className="rounded-2xl border border-destructive/40 bg-card p-4">
              <div className="flex items-center gap-2">
                <TriangleAlert className="h-4 w-4 text-destructive" />
                <p className="text-sm font-semibold">
                  Delete {overBy} {overBy === 1 ? "listing" : "listings"} before {renewalLabel(trader)}
                </p>
              </div>
              <p className="mt-1.5 text-xs leading-relaxed text-muted-foreground">
                {TIERS[pending].label} allows fewer active listings than you have. You can't add new ones until
                you're within the limit.
              </p>
              <Button
                variant="destructive"
                className="mt-3 w-full"
                onClick={() => {
                  setTrimOnly(true);
                  setDowngrade(pending);
                }}
              >
                Choose listings to delete
              </Button>
            </div>
          )}
        </div>
      )}

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
        <BuyListings trader={trader} onPurchaseStarted={reload} />
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
                  {isUpgrade
                    ? `Upgrades apply as soon as your app store confirms payment, and your plan year restarts from that day. Your unused ${TIERS[tier].label} time is credited by the store.`
                    : "Your annual total is shown on the next screen before you confirm."}
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

      {trader && (
        <DowngradeSheet
          trader={trader}
          tier={downgrade}
          listings={listings}
          scheduled={trimOnly}
          onClose={() => setDowngrade(null)}
          onChanged={onListingsChanged}
        />
      )}

      {splash && (
        <SuccessSplash title={splash.title} subtitle={splash.subtitle} onDone={() => setSplash(null)} />
      )}
    </div>
  );
}