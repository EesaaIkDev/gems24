import { useEffect } from "react";
import { useAuth } from "@/lib/AuthContext";

// Official Despia OneSignal registration scheme. Fires on load (guest id if
// not signed in) and again once a signed-in user is known.
export default function PushInit() {
  const { user: currentUser } = useAuth();

  useEffect(() => {
    const isDespia = navigator.userAgent.toLowerCase().includes("despia") || typeof window.despia !== "undefined";
    if (!isDespia) return;

    const userId = currentUser?.id || currentUser?.email || "guest_" + Math.floor(Math.random() * 1000000);

    if (window.despia) {
      window.despia(`setonesignalplayerid://?user_id=${userId}`);
    } else {
      window.location.href = `setonesignalplayerid://?user_id=${userId}`;
    }
  }, [currentUser?.id, currentUser?.email]);

  return null;
}