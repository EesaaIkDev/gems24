import { useEffect } from "react";
import { writePresence } from "@/lib/presence";

/**
 * Marks this trader as viewing a chat so pushes for it are muted. Writes only
 * when that changes — opening the chat, leaving it, or the app going to the
 * background and back. Staying "Active" in between is the app-wide heartbeat's job.
 */
export default function useChatPresence(traderId, conversationId) {
  useEffect(() => {
    if (!traderId || !conversationId) return;
    const sync = () => writePresence(traderId, document.visibilityState === "visible" ? conversationId : "");
    sync();
    document.addEventListener("visibilitychange", sync);
    return () => {
      document.removeEventListener("visibilitychange", sync);
      writePresence(traderId, "");
    };
  }, [traderId, conversationId]);
}
