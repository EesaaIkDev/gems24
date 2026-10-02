import { useEffect, useState } from "react";
import { base44 } from "@/api/base44Client";
import { listConversations, unreadFor } from "@/lib/chat";

/** Tracks total unread messages for the tab badge. Alerts come from native push. */
export default function useMessageNotifications(traderId) {
  const [unread, setUnread] = useState(0);

  useEffect(() => {
    if (!traderId) return setUnread(0);
    const refresh = async () => {
      const rows = await listConversations(traderId);
      setUnread(rows.reduce((sum, c) => sum + unreadFor(c, traderId), 0));
    };
    refresh();
    const unsubscribe = base44.entities.Conversation.subscribe(refresh);
    return unsubscribe;
  }, [traderId]);

  return unread;
}