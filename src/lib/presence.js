import { base44 } from "@/api/base44Client";

/**
 * Presence is written sparingly: once when the app comes to the foreground,
 * then every few minutes while it stays visible. Every write is a Trader
 * update, so the interval trades freshness for database load.
 */
export const HEARTBEAT_MS = 4 * 60 * 1000;

/** Someone counts as Active if their last write is this recent. Must exceed HEARTBEAT_MS. */
export const ACTIVE_WINDOW_MS = 5 * 60 * 1000;

/** Foreground/background flips closer together than this don't write again. */
const MIN_GAP_MS = 60 * 1000;

let lastWrite = 0;
let lastConversation = null;

/**
 * Writes the trader's presence, skipping redundant writes. A change of the
 * conversation being viewed always writes (it decides whether pushes are
 * muted); a plain "still here" beat is throttled.
 */
export function writePresence(traderId, conversationId = undefined) {
  if (!traderId) return;
  const changesChat = conversationId !== undefined && conversationId !== lastConversation;
  if (!changesChat && Date.now() - lastWrite < MIN_GAP_MS) return;
  lastWrite = Date.now();
  const patch = { active_at: new Date().toISOString() };
  if (conversationId !== undefined) {
    patch.active_conversation_id = conversationId;
    lastConversation = conversationId;
  }
  base44.entities.Trader.update(traderId, patch).catch(() => {});
}
