import { useEffect, useState } from "react";
import { base44 } from "@/api/base44Client";
import { useToast } from "@/components/ui/use-toast";
import { listConversations, unreadFor } from "@/lib/chat";
import { haptic } from "@/lib/despia";

/** Tracks total unread messages and raises an in-app toast on each new one. */
export default function useMessageNotifications(traderId) {
  const { toast } = useToast();
  const [unread, setUnread] = useState(0);

  useEffect(() => {
    if (!traderId) return setUnread(0);
    let previous = null;

    const refresh = async () => {
      const rows = await listConversations(traderId);
      const total = rows.reduce((sum, c) => sum + unreadFor(c, traderId), 0);
      if (previous !== null && total > previous) {
        const latest = rows.find((c) => unreadFor(c, traderId) > 0 && c.last_sender_id !== traderId);
        haptic("light");
        toast({ title: "New message", description: latest?.last_message || "You have a new message." });
      }
      previous = total;
      setUnread(total);
    };

    refresh();
    const unsubscribe = base44.entities.Conversation.subscribe(refresh);
    return unsubscribe;
  }, [traderId, toast]);

  return unread;
}