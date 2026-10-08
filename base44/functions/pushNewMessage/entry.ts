import { createClientFromRequest } from "npm:@base44/sdk@0.8.52";
import { sendPushNotification, userIdForTrader } from "../../shared/onesignal.ts";

// Pushes go out once per message and only while it's fresh, so calling this
// endpoint by hand can't be used to spam a trader.
const FRESH_MS = 5 * 60 * 1000;

// The app writes presence every few minutes (src/lib/presence.js), and clears
// active_conversation_id when the chat closes or the app is backgrounded, so a
// matching id within this window means the recipient has the chat open.
const VIEWING_MS = 5 * 60 * 1000;

export default async function (req) {
  try {
    const base44 = createClientFromRequest(req);
    const { message_id } = await req.json();
    const msg = (await base44.asServiceRole.entities.Message.filter({ id: String(message_id || "") }))?.[0];
    if (!msg) return Response.json({ error: "Not found" }, { status: 404 });
    if (msg.push_sent) return Response.json({ ok: true, skipped: "already sent" });
    if (Date.now() - new Date(msg.created_date).getTime() > FRESH_MS) {
      return Response.json({ ok: true, skipped: "stale" });
    }
    await base44.asServiceRole.entities.Message.update(msg.id, { push_sent: true });
    const convo = await base44.asServiceRole.entities.Conversation.get(msg.conversation_id);
    const recipientId = convo.participant_a_id === msg.sender_id ? convo.participant_b_id : convo.participant_a_id;
    const sender = await userIdForTrader(base44, msg.sender_id);
    const recipient = await userIdForTrader(base44, recipientId);
    const t = recipient.trader;
    const viewing = t?.active_conversation_id === msg.conversation_id &&
      t?.active_at && Date.now() - new Date(t.active_at).getTime() < VIEWING_MS;
    if (viewing) return Response.json({ ok: true, skipped: "recipient viewing chat" });
    const text = msg.text.length > 140 ? msg.text.slice(0, 137) + "..." : msg.text;
    const result = await sendPushNotification(recipient.userId, `New message from ${sender.name}`, text, {
      type: "chat",
      senderId: msg.sender_id,
      chatRoomId: msg.conversation_id,
    });
    return Response.json({ ok: true, result });
  } catch (error) {
    console.error("pushNewMessage failed", error);
    return Response.json({ error: "Push failed" }, { status: 500 });
  }
}
