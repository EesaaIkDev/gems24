import { createClientFromRequest } from 'npm:@base44/sdk@0.8.52';
import { restampListings } from '../../shared/traders.ts';

/**
 * Re-copies a trader's name, country, grade and verified badge onto their
 * listings after any of those change (see the TraderListingSync workflow).
 * Safe to call directly: it only writes the trader's true values.
 */
export default async function (req: Request): Promise<Response> {
  try {
    const base44 = createClientFromRequest(req);
    const { trader_id } = await req.json().catch(() => ({}));
    const trader = (
      await base44.asServiceRole.entities.Trader.filter({ id: String(trader_id || '') })
    )?.[0];
    if (!trader) return Response.json({ ok: true, skipped: 'not found' });
    await restampListings(base44, trader);
    return Response.json({ ok: true });
  } catch (error: any) {
    console.error('syncTraderListings failed', error);
    return Response.json({ error: 'Could not sync listings.' }, { status: 500 });
  }
}
