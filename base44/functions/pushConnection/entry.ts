import { createClientFromRequest } from "npm:@base44/sdk@0.8.52";
import { sendPushNotification, userIdForTrader } from "../../shared/onesignal.ts";

// Each status change is pushed once (tracked in pushed_status), so calling this
// endpoint by hand can't be used to spam a trader.
export default async function (req) {
  try {
    const base44 = createClientFromRequest(req);
    const { connection_id } = await req.json();
    const c = (await base44.asServiceRole.entities.Connection.filter({ id: String(connection_id || "") }))?.[0];
    if (!c) return Response.json({ error: "Not found" }, { status: 404 });
    if (c.pushed_status === c.status || !["pending", "accepted"].includes(c.status)) {
      return Response.json({ ok: true, skipped: "already sent" });
    }
    await base44.asServiceRole.entities.Connection.update(c.id, { pushed_status: c.status });
    let result;
    if (c.status === "pending") {
      const from = await userIdForTrader(base44, c.requester_id);
      const to = await userIdForTrader(base44, c.recipient_id);
      result = await sendPushNotification(to.userId, "New Connection Request", `${from.name} wants to connect with you.`, {
        type: "network_request",
        senderId: c.requester_id,
      });
    } else {
      const accepter = await userIdForTrader(base44, c.recipient_id);
      const to = await userIdForTrader(base44, c.requester_id);
      result = await sendPushNotification(to.userId, "Request Accepted!", `${accepter.name} accepted your connection request.`, {
        type: "network_accepted",
        userId: c.recipient_id,
      });
    }
    return Response.json({ ok: true, result });
  } catch (error) {
    console.error("pushConnection failed", error);
    return Response.json({ error: "Push failed" }, { status: 500 });
  }
}
