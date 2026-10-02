import { useEffect } from "react";
import { base44 } from "@/api/base44Client";

/** Marks this trader as actively viewing a chat so pushes for it are muted. */
export default function useChatPresence(traderId, conversationId) {
  useEffect(() => {
    if (!traderId || !conversationId) return;
    const set = (active) =>
      base44.entities.Trader.update(traderId, {
        active_conversation_id: active ? conversationId : "",
        active_at: new Date().toISOString(),
      }).catch(() => {});
    const sync = () => set(document.visibilityState === "visible");
    sync();
    const beat = setInterval(() => document.visibilityState === "visible" && set(true), 30000);
    document.addEventListener("visibilitychange", sync);
    return () => {
      clearInterval(beat);
      document.removeEventListener("visibilitychange", sync);
      set(false);
    };
  }, [traderId, conversationId]);
}