import { createClientFromRequest } from 'npm:@base44/sdk@0.8.52';
import { connectionBetween, sessionTrader } from '../../shared/traders.ts';

const pair = (x: string, y: string) => (x < y ? [x, y] : [y, x]);

/**
 * Finds or creates the caller's conversation with another trader. Chats open
 * only between accepted connections, and the server stamps both owners' user
 * ids — the read rules on Conversation and Message are based on them.
 */
export default async function (req: Request): Promise<Response> {
  try {
    const base44 = createClientFromRequest(req);
    const { user, trader } = await sessionTrader(base44);
    if (!user) return Response.json({ error: 'Unauthorized' }, { status: 401 });
    if (!trader) return Response.json({ error: 'No profile found' }, { status: 404 });

    const { trader_id, context_label, context_path } = await req.json().catch(() => ({}));
    const otherId = String(trader_id || '');
    if (!otherId || otherId === trader.id) {
      return Response.json({ error: 'Invalid trader' }, { status: 400 });
    }
    const connection = await connectionBetween(base44, trader.id, otherId);
    if (connection?.status !== 'accepted') {
      return Response.json({ error: 'Connect first to start a chat.' }, { status: 403 });
    }
    const other = (await base44.asServiceRole.entities.Trader.filter({ id: otherId }))?.[0];
    if (!other) return Response.json({ error: 'Trader not found' }, { status: 404 });

    const [a, b] = pair(trader.id, otherId);
    const owners: Record<string, string> = { [trader.id]: user.id, [otherId]: other.created_by_id || '' };
    const existing = (
      await base44.asServiceRole.entities.Conversation.filter({ participant_a_id: a, participant_b_id: b })
    )?.[0];
    if (existing) return Response.json({ conversation: existing });

    const conversation = await base44.asServiceRole.entities.Conversation.create({
      participant_a_id: a,
      participant_b_id: b,
      participant_a_user_id: owners[a],
      participant_b_user_id: owners[b],
      context_label: String(context_label || '').slice(0, 120),
      context_path: String(context_path || '').startsWith('/') ? String(context_path).slice(0, 200) : '',
      unread_a: 0,
      unread_b: 0,
    });
    return Response.json({ conversation });
  } catch (error: any) {
    console.error('openConversation failed', error);
    return Response.json({ error: 'Could not open chat.' }, { status: 500 });
  }
}
