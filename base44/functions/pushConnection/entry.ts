import { createClientFromRequest } from "npm:@base44/sdk@0.8.52";
import { sendPushNotification, userIdForTrader } from "../../shared/onesignal.ts";

export default async function (req) {
  try {
    const base44 = createClientFromRequest(req);
    const { connection_id } = await req.json();
    const c = await base44.asServiceRole.entities.Connection.get(connection_id);
    if (!c) return Response.json({ error: "Not found" }, { status: 404 });
    let result;
    if (c.status === "pending") {
      const from = await userIdForTrader(base44, c.requester_id);
      const to = await userIdForTrader(base44, c.recipient_id);
      result = await sendPushNotification(to.userId, "New Connection Request", `${from.name} wants to connect with you.`, {
        type: "network_request",
        senderId: c.requester_id,
      });
    } else if (c.status === "accepted") {
      const accepter = await userIdForTrader(base44, c.recipient_id);
      const to = await userIdForTrader(base44, c.requester_id);
      result = await sendPushNotification(to.userId, "Request Accepted!", `${accepter.name} accepted your connection request.`, {
        type: "network_accepted",
        userId: c.recipient_id,
      });
    }
    return Response.json({ ok: true, result });
  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
}