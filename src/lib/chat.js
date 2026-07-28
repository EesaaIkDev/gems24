import { base44 } from "@/api/base44Client";

/** Participant ids are stored sorted so a pair always maps to one conversation row. */
const pair = (x, y) => (x < y ? [x, y] : [y, x]);

export const otherIdOf = (c, viewerId) =>
  c.participant_a_id === viewerId ? c.participant_b_id : c.participant_a_id;

export const unreadFor = (c, viewerId) =>
  (c.participant_a_id === viewerId ? c.unread_a : c.unread_b) || 0;

export async function findOrCreateConversation(viewerId, otherId, context = {}) {
  const [a, b] = pair(viewerId, otherId);
  const rows = await base44.entities.Conversation.filter({ participant_a_id: a, participant_b_id: b });
  if (rows[0]) return rows[0];
  return base44.entities.Conversation.create({
    participant_a_id: a,
    participant_b_id: b,
    context_label: context.label || "",
    context_path: context.path || "",
    unread_a: 0,
    unread_b: 0,
  });
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

export async function sendMessage(conversation, senderId, text) {
  const message = await base44.entities.Message.create({
    conversation_id: conversation.id,
    sender_id: senderId,
    text,
  });
  const senderIsA = conversation.participant_a_id === senderId;
  await base44.entities.Conversation.update(conversation.id, {
    last_message: text,
    last_message_at: new Date().toISOString(),
    last_sender_id: senderId,
    [senderIsA ? "unread_b" : "unread_a"]:
      (senderIsA ? conversation.unread_b : conversation.unread_a || 0) + 1,
  });
  return message;
}

export async function markRead(conversation, viewerId) {
  if (unreadFor(conversation, viewerId) === 0) return;
  await base44.entities.Conversation.update(conversation.id, {
    [conversation.participant_a_id === viewerId ? "unread_a" : "unread_b"]: 0,
  });
}