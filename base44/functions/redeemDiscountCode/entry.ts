import { createClientFromRequest } from 'npm:@base44/sdk@0.8.44';
import { TIER_KEYS, callerTrader } from '../../shared/traders.ts';

/**
 * Validates a discount code and, for a 100% code, grants the grade.
 *
 * This is the only path allowed to set subscription_tier from a code. The
 * browser previously read the DiscountCode row, incremented times_used itself
 * and wrote the tier straight onto its own Trader row — so any signed-in user
 * could hand themselves Platinum. Codes are no longer readable by the client at
 * all (see the entity's rls); everything is decided here.
 *
 * A partial code is only reported back as a percentage — nothing is recorded and
 * no usage is consumed until the store actually bills the trader.
 */
export default async function (req: Request): Promise<Response> {
  try {
    const base44 = createClientFromRequest(req);

    const user = await base44.auth.me();
    if (!user?.email) {
      return Response.json({ error: 'Unauthorized' }, { status: 401 });
    }

    let body: any = {};
    try {
      body = await req.json();
    } catch {
      return Response.json({ error: 'Invalid request' }, { status: 400 });
    }

    const code = String(body?.code || '').trim().toUpperCase();
    const tier = String(body?.tier || '');

    if (code.length !== 6) {
      return Response.json({ state: 'invalid', reason: 'Codes are 6 characters long.' });
    }
    if (!TIER_KEYS.includes(tier)) {
      return Response.json({ error: 'Unknown grade' }, { status: 400 });
    }

    const trader = await callerTrader(base44, user.email);
    if (!trader) {
      return Response.json({ error: 'No trader profile found' }, { status: 404 });
    }
    if (trader.account_type !== 'trader') {
      return Response.json({ error: 'Only trader accounts can redeem a subscription code' }, { status: 403 });
    }

    const found = (await base44.asServiceRole.entities.DiscountCode.filter({ code }))?.[0] ?? null;
    if (!found || found.active === false) {
      return Response.json({ state: 'invalid', reason: "That code isn't valid." });
    }
    if (!(found.tiers || []).includes(tier)) {
      return Response.json({ state: 'wrong_tier', reason: "That code can't be used for this grade." });
    }

    // Per-code cap. Absent max_uses means unlimited, which is the old behaviour.
    if (found.max_uses && (found.times_used || 0) >= found.max_uses) {
      return Response.json({ state: 'exhausted', reason: 'That code has already been fully used.' });
    }

    // Per-trader cap: one grant per code, ever.
    const prior = await base44.asServiceRole.entities.CodeRedemption.filter({
      code,
      trader_id: trader.id,
    });
    if ((prior || []).length > 0) {
      return Response.json({ state: 'already_used', reason: "You've already used that code." });
    }

    const percentOff = Number(found.percent_off) || 0;

    if (percentOff < 100) {
      // Nothing consumed — the discount is applied by the store at billing.
      return Response.json({ state: 'discount', percentOff });
    }

    await base44.asServiceRole.entities.CodeRedemption.create({
      code,
      trader_id: trader.id,
      user_email: trader.user_email || user.email,
      tier,
      percent_off: percentOff,
      redeemed_at: new Date().toISOString(),
    });
    await base44.asServiceRole.entities.DiscountCode.update(found.id, {
      times_used: (found.times_used || 0) + 1,
    });
    await base44.asServiceRole.entities.Trader.update(trader.id, { subscription_tier: tier });

    console.log(`discount code granted trader=${trader.id} tier=${tier} code=${code}`);

    return Response.json({ state: 'granted', tier });
  } catch (error: any) {
    console.error('redeemDiscountCode failed', error);
    return Response.json({ error: 'Could not check that code.' }, { status: 500 });
  }
}