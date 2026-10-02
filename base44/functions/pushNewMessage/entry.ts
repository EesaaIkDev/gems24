import { createClientFromRequest } from "npm:@base44/sdk@0.8.52";
import { sendPushNotification, userIdForTrader } from "../../shared/onesignal.ts";

export default async function (req) {
  try {
    const base44 = createClientFromRequest(req);
    const { message_id } = await req.json();
    const msg = await base44.asServiceRole.entities.Message.get(message_id);
    if (!msg) return Response.json({ error: "Not found" }, { status: 404 });
    const convo = await base44.asServiceRole.entities.Conversation.get(msg.conversation_id);
    const recipientId = convo.participant_a_id === msg.sender_id ? convo.participant_b_id : convo.participant_a_id;
    const sender = await userIdForTrader(base44, msg.sender_id);
    const recipient = await userIdForTrader(base44, recipientId);
    const text = msg.text.length > 140 ? msg.text.slice(0, 137) + "..." : msg.text;
    const result = await sendPushNotification(recipient.userId, `New message from ${sender.name}`, text, {
      type: "chat",
      senderId: msg.sender_id,
      chatRoomId: msg.conversation_id,
    });
    return Response.json({ ok: true, result });
  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
}