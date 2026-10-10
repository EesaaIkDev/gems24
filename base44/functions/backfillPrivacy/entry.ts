import { createClientFromRequest } from 'npm:@base44/sdk@0.8.52';
import { restampListings } from '../../shared/traders.ts';

/**
 * One-off migration for the privacy rules. Conversations, messages and
 * connections created before them have no owner user ids, so the new read
 * rules hide them from their own participants until this runs. Also re-copies
 * every trader's true details onto their listings, wiping any forged badges.
 *
 * Admin only. Idempotent — safe to run again.
 */
const PAGE = 200;

async function all(entity: any) {
  const rows: any[] = [];
  for (let skip = 0; ; skip += PAGE) {
    const page = await entity.list('created_date', PAGE, skip);
    rows.push(...(page || []));
    if (!page || page.length < PAGE) return rows;
  }
}

export default async function (req: Request): Promise<Response> {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me().catch(() => null);
    if (user?.role !== 'admin') return Response.json({ error: 'Forbidden' }, { status: 403 });

    const svc = base44.asServiceRole.entities;
    const traders = await all(svc.Trader);
    const owner: Record<string, string> = Object.fromEntries(
      traders.map((t: any) => [t.id, t.created_by_id || ''])
    );
    const counts = { conversations: 0, messages: 0, connections: 0, traders: traders.length };

    const conversations = await all(svc.Conversation);
    const convById: Record<string, any> = {};
    for (const c of conversations) {
      const patch = {
        participant_a_user_id: owner[c.participant_a_id] || '',
        participant_b_user_id: owner[c.participant_b_id] || '',
      };
      convById[c.id] = { ...c, ...patch };
      if (c.participant_a_user_id !== patch.participant_a_user_id || c.participant_b_user_id !== patch.participant_b_user_id) {
        await svc.Conversation.update(c.id, patch);
        counts.conversations++;
      }
    }

    for (const m of await all(svc.Message)) {
      const c = convById[m.conversation_id];
      if (!c) continue;
      const sender = c.participant_a_id === m.sender_id ? c.participant_a_user_id : c.participant_b_user_id;
      const recipient = c.participant_a_id === m.sender_id ? c.participant_b_user_id : c.participant_a_user_id;
      if (m.sender_user_id !== sender || m.recipient_user_id !== recipient || !m.push_sent) {
        await svc.Message.update(m.id, { sender_user_id: sender, recipient_user_id: recipient, push_sent: true });
        counts.messages++;
      }
    }

    for (const k of await all(svc.Connection)) {
      const patch = {
        requester_user_id: owner[k.requester_id] || '',
        recipient_user_id: owner[k.recipient_id] || '',
        pushed_status: k.status,
      };
      if (k.requester_user_id !== patch.requester_user_id || k.recipient_user_id !== patch.recipient_user_id || !k.pushed_status) {
        await svc.Connection.update(k.id, patch);
        counts.connections++;
      }
    }

    for (const t of traders) await restampListings(base44, t);

    console.log('backfillPrivacy done', counts);
    return Response.json({ ok: true, updated: counts });
  } catch (error: any) {
    console.error('backfillPrivacy failed', error);
    return Response.json({ error: 'Backfill failed' }, { status: 500 });
  }
}
