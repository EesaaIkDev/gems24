import { useCallback, useEffect, useState } from "react";
import { isNative } from "@/lib/despia";
import { PURCHASE_EVENT } from "@/lib/GoldMembership";

/**
 * Refreshes the trader after the store reports a purchase or a restore.
 *
 * The grade itself is set by the store webhook, never here: writing
 * subscription_tier from the client meant the device could claim any grade it
 * liked. This hook only asks the app to re-read the server's answer.
 */
export default function useEntitlements(trader, onSynced) {
  const [checking, setChecking] = useState(false);

  const check = useCallback(async () => {
    if (!isNative || !trader?.id) return;
    setChecking(true);
    await onSynced?.();
    setChecking(false);
  }, [trader?.id, onSynced]);

  // Purchases are handled app-wide by GoldMembershipProvider (haptic + refresh);
  // this page just re-reads its own copy when one lands.
  useEffect(() => {
    window.addEventListener(PURCHASE_EVENT, check);
    window.onRevenueCatCenter = (event) => {
      if (event?.event === "restoreCompleted" || event?.event === "dismissed") check();
    };
    return () => {
      window.removeEventListener(PURCHASE_EVENT, check);
      window.onRevenueCatCenter = undefined;
    };
  }, [check]);

  return { checking, recheck: check };
}