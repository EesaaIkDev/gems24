import { base44 } from "@/api/base44Client";

export const otherIdOf = (c, viewerId) =>
  c.participant_a_id === viewerId ? c.participant_b_id : c.participant_a_id;

export const unreadFor = (c, viewerId) =>
  (c.participant_a_id === viewerId ? c.unread_a : c.unread_b) || 0;

/**
 * Chats are opened server-side: it checks the two traders are connected and
 * records who may read the conversation.
 */
export async function findOrCreateConversation(otherId, context = {}) {
  const { data } = await base44.functions.invoke("openConversation", {
    trader_id: otherId,
    context_label: context.label || "",
    context_path: context.path || "",
  });
  return data.conversation;
}

export async function listConversations(viewerId) {
  const [asA, asB] = await Promise.all([
    base44.entities.Conversation.filter({ participant_a_id: viewerId }, "-updated_date", 100),
    base44.entities.Conversation.filter({ participant_b_id: viewerId }, "-updated_date", 100),
  ]);
  return [...asA, ...asB].sort(
    (x, y) =>
      new Date(y.last_message_at || y.created_date) - new Date(x.last_message_at || x.created_date)
  );
}

/** Sent server-side so the sender can't be spoofed. Returns { message, conversation }. */
export async function sendMessage(conversation, text) {
  const { data } = await base44.functions.invoke("sendChatMessage", {
    conversation_id: conversation.id,
    text,
  });
  return data;
}

export async function markRead(conversation, viewerId, shareReceipt = true) {
  if (unreadFor(conversation, viewerId) === 0) return;
  const isA = conversation.participant_a_id === viewerId;
  await base44.entities.Conversation.update(conversation.id, {
    [isA ? "unread_a" : "unread_b"]: 0,
    ...(shareReceipt ? { [isA ? "read_at_a" : "read_at_b"]: new Date().toISOString() } : {}),
  });
}

/** When the other participant last read the chat, or null if receipts are hidden either way. */
export const otherReadAt = (c, viewer, other) => {
  if (viewer?.read_receipts === false || other?.read_receipts === false) return null;
  return c.participant_a_id === viewer.id ? c.read_at_b : c.read_at_a;
};

/** Professional presence: Active within the last 2 minutes, otherwise Away. */
export const isActive = (trader) =>
  !!trader?.active_at && Date.now() - new Date(trader.active_at).getTime() < 120000;