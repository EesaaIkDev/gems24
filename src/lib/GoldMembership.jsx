import React, { createContext, useCallback, useContext, useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import useCurrentTrader from "@/hooks/useCurrentTrader";
import { haptic, isNative } from "@/lib/despia";
import { getActiveEntitlements, launchPaywall } from "@/lib/revenuecat";
import { tierRank } from "@/lib/gems";

/**
 * Gold membership, app-wide.
 *
 * `isGoldMember` comes from the server-confirmed plan (set by storeWebhook), so
 * a device can't unlock features for itself. The phone's own purchase history
 * is read on launch only to notice a purchase the server hasn't confirmed yet
 * and refresh until it lands.
 */
const GoldContext = createContext({ isGoldMember: false, deviceHasGold: false, upgradeToGold: () => {}, refresh: () => {} });

export const PURCHASE_EVENT = "gems24:purchase";
const REFRESH_DELAYS = [0, 3000, 8000, 15000, 30000];

const refreshAll = () => window.dispatchEvent(new Event("app:refresh"));

export function GoldMembershipProvider({ children }) {
  const { trader } = useCurrentTrader();
  const navigate = useNavigate();
  const [deviceHasGold, setDeviceHasGold] = useState(false);
  const timers = useRef([]);
  // Platinum (business) includes everything Gold unlocks.
  const isGoldMember = trader?.account_type === "trader" && tierRank(trader.subscription_tier) >= tierRank("gold");

  // The store webhook usually lands within seconds; re-read the plan a few times.
  const refresh = useCallback(() => {
    timers.current.forEach(clearTimeout);
    timers.current = REFRESH_DELAYS.map((ms) => setTimeout(refreshAll, ms));
  }, []);

  useEffect(() => () => timers.current.forEach(clearTimeout), []);

  // On launch: does this phone hold an active Gold entitlement?
  useEffect(() => {
    if (!isNative || !trader?.id) return;
    let alive = true;
    getActiveEntitlements()
      .then((active) => alive && setDeviceHasGold(active.includes("gold")))
      .catch(() => {});
    return () => {
      alive = false;
    };
  }, [trader?.id]);

  // Purchased on this device but not confirmed yet: keep checking the server.
  useEffect(() => {
    if (deviceHasGold && trader && !isGoldMember) refresh();
  }, [deviceHasGold, trader, isGoldMember, refresh]);

  // Completed purchases, from anywhere in the app.
  useEffect(() => {
    window.onRevenueCatPurchase = (event) => {
      haptic("success");
      setDeviceHasGold((had) => had || event?.entitlementId === "gold" || event?.productId === "gold");
      window.dispatchEvent(new CustomEvent(PURCHASE_EVENT, { detail: event }));
      refresh();
    };
    return () => {
      window.onRevenueCatPurchase = undefined;
    };
  }, [refresh]);

  const upgradeToGold = useCallback(() => {
    haptic("heavy");
    // Gold is for individual traders; buyers switch first, businesses use Platinum.
    if (!trader || trader.account_type !== "trader" || trader.trader_kind === "business" || !isNative) {
      return navigate(trader?.account_type === "buyer" ? "/profile" : "/subscription");
    }
    launchPaywall(trader.id);
  }, [trader, navigate]);

  return (
    <GoldContext.Provider value={{ isGoldMember, deviceHasGold, upgradeToGold, refresh }}>
      {children}
    </GoldContext.Provider>
  );
}

export const useGoldMembership = () => useContext(GoldContext);
