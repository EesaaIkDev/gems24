import { useEffect } from "react";
import { HEARTBEAT_MS, writePresence } from "@/lib/presence";

/**
 * Keeps the trader's "Active" status fresh while the app is open and visible:
 * one write when the app comes to the foreground, then one every few minutes.
 */
export default function useActivityHeartbeat(traderId) {
  useEffect(() => {
    if (!traderId) return;
    const beat = () => document.visibilityState === "visible" && writePresence(traderId);
    beat();
    const t = setInterval(beat, HEARTBEAT_MS);
    document.addEventListener("visibilitychange", beat);
    return () => {
      clearInterval(t);
      document.removeEventListener("visibilitychange", beat);
    };
  }, [traderId]);
}
