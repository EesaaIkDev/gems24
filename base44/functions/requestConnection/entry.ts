import { createClientFromRequest } from 'npm:@base44/sdk@0.8.52';
import { connectionBetween, sessionTrader } from '../../shared/traders.ts';

/**
 * Sends a network request from the caller to another trader. Connections can
 * only be created here: the server fixes the requester to the caller and stamps
 * both owners' user ids, which is what the read rules on Connection check.
 */
export default async function (req: Request): Promise<Response> {
  try {
    const base44 = createClientFromRequest(req);
    const { user, trader } = await sessionTrader(base44);
    if (!user) return Response.json({ error: 'Unauthorized' }, { status: 401 });
    if (!trader) return Response.json({ error: 'No profile found' }, { status: 404 });

    const { trader_id } = await req.json().catch(() => ({}));
    const otherId = String(trader_id || '');
    if (!otherId || otherId === trader.id) {
      return Response.json({ error: 'Invalid trader' }, { status: 400 });
    }
    const other = (await base44.asServiceRole.entities.Trader.filter({ id: otherId }))?.[0];
    if (!other) return Response.json({ error: 'Trader not found' }, { status: 404 });

    const existing = await connectionBetween(base44, trader.id, otherId);
    if (existing) return Response.json({ connection: existing });

    const connection = await base44.asServiceRole.entities.Connection.create({
      requester_id: trader.id,
      recipient_id: otherId,
      requester_user_id: user.id,
      recipient_user_id: other.created_by_id || '',
      status: 'pending',
    });
    return Response.json({ connection });
  } catch (error: any) {
    console.error('requestConnection failed', error);
    return Response.json({ error: 'Could not send request.' }, { status: 500 });
  }
}
