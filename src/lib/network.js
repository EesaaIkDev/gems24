import { base44 } from "@/api/base44Client";

/**
 * Networking works like a follow system: a Connection row is created the moment
 * a trader taps "Network". Its status decides messaging only —
 * "accepted" = can chat, "pending" = awaiting the other trader's approval.
 * Feed relationships count both.
 */
const involves = (c, id) => c.requester_id === id || c.recipient_id === id;

export const otherSide = (c, viewerId) =>
  c.requester_id === viewerId ? c.recipient_id : c.requester_id;

export async function listMyConnections(viewerId) {
  const all = await base44.entities.Connection.list("-created_date", 500);
  return all.filter((c) => involves(c, viewerId));
}

export const findConnection = (rows, viewerId, otherId) =>
  rows.find((c) => involves(c, viewerId) && involves(c, otherId)) || null;

/** Trader ids whose listings get boosted in the viewer's feed — established networks only. */
export const feedTraderIds = (rows, viewerId) => [
  ...new Set(rows.filter((c) => c.status === "accepted").map((c) => otherSide(c, viewerId))),
];

export const canMessage = (connection) => connection?.status === "accepted";

export async function getConnection(viewerId, otherId) {
  const rows = await listMyConnections(viewerId);
  return findConnection(rows, viewerId, otherId);
}

/** Connects the viewer to a trader, respecting that trader's approval setting. */
export async function networkWith(viewerId, otherTrader) {
  const existing = await getConnection(viewerId, otherTrader.id);
  if (existing) return existing;
  return base44.entities.Connection.create({
    requester_id: viewerId,
    recipient_id: otherTrader.id,
    status: otherTrader.require_message_approval ? "pending" : "accepted",
  });
}

/**
 * Accepting establishes the network in both directions at once (a single
 * symmetric row). Declining removes the row, so the request simply disappears
 * from the requester's side with no negative signal.
 */
export async function respondToRequest(connectionId, status) {
  if (status === "declined") return base44.entities.Connection.delete(connectionId);
  return base44.entities.Connection.update(connectionId, { status: "accepted" });
}

export async function listIncomingRequests(viewerId) {
  const rows = await listMyConnections(viewerId);
  return rows.filter((c) => c.status === "pending" && c.recipient_id === viewerId);
}