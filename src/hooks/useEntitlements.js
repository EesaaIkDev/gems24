import { useCallback, useEffect, useState } from "react";
import { base44 } from "@/api/base44Client";
import { isNative } from "@/lib/despia";
import { getEntitledTier } from "@/lib/revenuecat";

/**
 * Keeps the trader's subscription_tier in sync with their live store entitlements.
 * Runs on load, after every purchase, and when the Customer Center reports a change.
 */
export default function useEntitlements(trader, onSynced) {
  const [checking, setChecking] = useState(isNative);

  const check = useCallback(async () => {
    if (!isNative || !trader?.id) return;
    setChecking(true);
    const tier = await getEntitledTier();
    if (tier !== trader.subscription_tier) {
      await base44.entities.Trader.update(trader.id, { subscription_tier: tier });
      onSynced?.();
    }
    setChecking(false);
  }, [trader?.id, trader?.subscription_tier, onSynced]);

  useEffect(() => {
    check();
    window.onRevenueCatPurchase = check;
    window.onRevenueCatCenter = (event) => {
      if (event?.event === "restoreCompleted" || event?.event === "dismissed") check();
    };
    return () => {
      window.onRevenueCatPurchase = undefined;
      window.onRevenueCatCenter = undefined;
    };
  }, [check]);

  return { checking, recheck: check };
}