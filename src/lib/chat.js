import { base44 } from "@/api/base44Client";
import { ACTIVE_WINDOW_MS } from "@/lib/presence";
import { deliveryStatus } from "@/lib/messageDelivery";

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

export const MESSAGE_PAGE = 50;

/**
 * One page of a chat, newest first on the server and returned oldest-first for
 * display. Pass the previous page's cursor to walk further back.
 */
export async function loadMessagePage(conversationId, cursor = null) {
  const page = await base44.entities.Message.filter(
    { conversation_id: conversationId },
    cursor ? { cursor, limit: MESSAGE_PAGE } : { sort: "-created_date", limit: MESSAGE_PAGE }
  );
  return { items: [...(page.items || [])].reverse(), cursor: page.has_more ? page.next_cursor : null };
}

const byCreated = (a, b) => new Date(a.created_date) - new Date(b.created_date);

/** Adds or replaces messages by id, keeping the list in chronological order. */
export function upsertMessages(list, incoming) {
  const byId = new Map(list.map((m) => [m.id, m]));
  for (const m of incoming) if (m?.id) byId.set(m.id, { ...byId.get(m.id), ...m });
  return [...byId.values()].sort(byCreated);
}

/** Sent server-side so the sender can't be spoofed. Returns { message, conversation }. */
export async function sendMessage(conversation, text) {
  const { data } = await base44.functions.invoke("sendChatMessage", {
    conversation_id: conversation.id,
    text,
  });
  return data;
}

export async function acknowledgeMessage(conversationId, messageId, read = false) {
  const { data } = await base44.functions.invoke("acknowledgeMessage", {
    conversation_id: conversationId,
    message_id: messageId,
    read,
  });
  return data.conversation;
}

/** When the other participant last read the chat, or null if receipts are hidden either way. */
export const otherReadAt = (c, viewer, other) => {
  if (viewer?.read_receipts === false || other?.read_receipts === false) return null;
  return c.participant_a_id === viewer.id ? c.read_at_b : c.read_at_a;
};

export function messageDeliveryStatus(message, conversation, viewer, other) {
  return deliveryStatus(message, conversation, viewer?.id,
    !!otherReadAt(conversation, viewer, other));
}

/** Professional presence: Active if the last heartbeat is recent, otherwise Away. */
export const isActive = (trader) =>
  !!trader?.active_at && Date.now() - new Date(trader.active_at).getTime() < ACTIVE_WINDOW_MS;