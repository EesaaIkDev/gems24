import { createClientFromRequest } from 'npm:@base44/sdk@0.8.52';
import { businessFields, sessionTrader } from '../../shared/traders.ts';

/**
 * One-way switch from an individual trader account to a business account.
 * Takes the business details (no documents — KYB happens through Shufti) and
 * acts only on the caller's own profile.
 *
 * Businesses are on Platinum only. A plan the trader already has stays until it
 * ends; the store webhook won't renew Bronze–Gold for a business.
 */
export default async function (req: Request): Promise<Response> {
  try {
    const base44 = createClientFromRequest(req);
    const { user, trader } = await sessionTrader(base44);
    if (!user) return Response.json({ error: 'Unauthorized' }, { status: 401 });
    if (!trader) return Response.json({ error: 'No profile found' }, { status: 404 });
    if (trader.account_type !== 'trader') {
      return Response.json({ error: 'Switch to a trader account first.' }, { status: 409 });
    }
    if (trader.trader_kind === 'business') return Response.json({ state: 'already_business' });

    const { fields, error } = businessFields(await req.json().catch(() => ({})));
    if (error) return Response.json({ error }, { status: 400 });

    await base44.asServiceRole.entities.Trader.update(trader.id, { ...fields, trader_kind: 'business' });
    console.log(`upgradeToBusiness: trader=${trader.id} is now a business`);
    return Response.json({ state: 'upgraded' });
  } catch (error: any) {
    console.error('upgradeToBusiness failed', error);
    return Response.json({ error: 'Could not switch your account.' }, { status: 500 });
  }
}
