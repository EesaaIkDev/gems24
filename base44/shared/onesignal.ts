import { secrets } from "base44:runtime";

const APP_ID = "78ef65ef-97d3-42ee-b333-03ae743891ca";

export async function sendPushNotification(targetUserId, title, message, extraData = {}) {
  if (!targetUserId) return { skipped: "no target" };
  const res = await fetch("https://api.onesignal.com/notifications", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Key ${secrets.get("ONESIGNAL_REST_API_KEY")}`,
    },
    body: JSON.stringify({
      app_id: APP_ID,
      target_channel: "push",
      include_aliases: { external_id: [String(targetUserId)] },
      headings: { en: title },
      contents: { en: message },
      data: extraData,
    }),
  });
  return await res.json();
}

// Push ids are registered with the app user's id, which owns the Trader record.
export async function userIdForTrader(base44, traderId) {
  const [t] = await base44.asServiceRole.entities.Trader.filter({ id: traderId }, null, 1);
  return { userId: t?.created_by_id, name: t?.business_name || t?.full_name || "A trader", trader: t };
}