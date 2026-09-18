import { useEffect, useRef, useState } from "react";
import {
  canUseWebPush,
  initOneSignal,
  isRegistered,
  onPushSubscriptionChange,
  pushOptedIn,
  pushSubscriptionId,
  requestPushPermission,
} from "@/lib/onesignal";

const SHOWN_KEY = "gems24_onesignal_verified";

/**
 * Initialises the OneSignal web SDK and reports when this browser is ready to
 * receive push. On web a subscription id only arrives after the visitor opts
 * in, so the dialog is what gates the permission request.
 * The change listener is kept in a ref because OneSignal holds observers weakly.
 */
export default function useOneSignal() {
  const [showDialog, setShowDialog] = useState(false);
  const listenerRef = useRef(null);
  const shownRef = useRef(false);

  useEffect(() => {
    if (!canUseWebPush()) return;
    if (localStorage.getItem(SHOWN_KEY) === "true") shownRef.current = true;

    let cleanup;
    let cancelled = false;

    const reveal = () => {
      if (shownRef.current || cancelled) return;
      shownRef.current = true;
      localStorage.setItem(SHOWN_KEY, "true");
      setShowDialog(true);
    };

    initOneSignal().then((ready) => {
      if (!ready || cancelled) return;

      listenerRef.current = () => {
        // Already subscribed on a later visit — nothing left to confirm.
        if (isRegistered(pushSubscriptionId()) && pushOptedIn()) shownRef.current = true;
      };
      cleanup = onPushSubscriptionChange(listenerRef.current);

      // Evaluate the current state too: the id may already exist by now.
      if (isRegistered(pushSubscriptionId()) && pushOptedIn()) {
        shownRef.current = true;
        return;
      }
      reveal();
    });

    return () => {
      cancelled = true;
      cleanup?.();
    };
  }, []);

  const confirm = async () => {
    setShowDialog(false);
    await requestPushPermission().catch(() => {});
  };

  return { showDialog, confirm };
}