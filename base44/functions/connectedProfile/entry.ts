import { createClientFromRequest } from 'npm:@base44/sdk@0.8.52';
import { connectionBetween, sessionTrader } from '../../shared/traders.ts';

/**
 * The private bits of another trader's profile that an accepted connection may
 * see: their contact email and Active/Away presence. Phone numbers are never
 * shared. Everyone else gets nothing.
 */
export default async function (req: Request): Promise<Response> {
  try {
    const base44 = createClientFromRequest(req);
    const { user, trader } = await sessionTrader(base44);
    if (!user || !trader) return Response.json({ connected: false });

    const { trader_id } = await req.json().catch(() => ({}));
    const otherId = String(trader_id || '');
    if (!otherId || otherId === trader.id) return Response.json({ connected: false });

    const connection = await connectionBetween(base44, trader.id, otherId);
    if (connection?.status !== 'accepted') return Response.json({ connected: false });

    const other = (await base44.asServiceRole.entities.Trader.filter({ id: otherId }))?.[0];
    if (!other) return Response.json({ connected: false });
    return Response.json({
      connected: true,
      contact_email: other.contact_email || '',
      active_at: other.active_at || null,
    });
  } catch (error: any) {
    console.error('connectedProfile failed', error);
    return Response.json({ error: 'Could not load profile.' }, { status: 500 });
  }
}
