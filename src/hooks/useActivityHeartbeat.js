import { useEffect } from "react";
import { base44 } from "@/api/base44Client";

/** Keeps the trader's "Active" status fresh while the app is open and visible. */
export default function useActivityHeartbeat(traderId) {
  useEffect(() => {
    if (!traderId) return;
    const beat = () =>
      document.visibilityState === "visible" &&
      base44.entities.Trader.update(traderId, { active_at: new Date().toISOString() }).catch(() => {});
    beat();
    const t = setInterval(beat, 60000);
    document.addEventListener("visibilitychange", beat);
    return () => {
      clearInterval(t);
      document.removeEventListener("visibilitychange", beat);
    };
  }, [traderId]);
}