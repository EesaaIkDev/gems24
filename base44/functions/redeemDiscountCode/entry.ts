import { createClientFromRequest } from 'npm:@base44/sdk@0.8.44';
import { CYCLE_MONTHS, MONTH_MS, TIER_KEYS, callerTrader, planLapsed, tierAllowed, tierRank } from '../../shared/traders.ts';

/**
 * Web-only free-access codes. A valid code grants the chosen grade for one
 * 3-month cycle at no charge; plan_renews_at marks its end, after which the
 * plan lapses like any unrenewed one. Everything is decided here — the client
 * never reads a DiscountCode row or writes a grade itself.
 *
 * Only traders without an active plan can redeem, so a code never overwrites a
 * store subscription (whose renewal/expiry events would otherwise clash).
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
    if (!tierAllowed(trader, tier)) {
      return Response.json({
        state: 'wrong_tier',
        reason: tier === 'platinum'
          ? 'Platinum is for registered businesses.'
          : 'Business accounts use the Platinum plan.',
      });
    }
    if (tierRank(trader.subscription_tier) > 0 && !planLapsed(trader)) {
      return Response.json({ state: 'has_plan', reason: 'Codes can only be used when you have no active plan.' });
    }

    const found = (await base44.asServiceRole.entities.DiscountCode.filter({ code }))?.[0] ?? null;
    if (!found || found.active === false) {
      return Response.json({ state: 'invalid', reason: "That code isn't valid." });
    }
    if (!(found.tiers || []).includes(tier)) {
      return Response.json({ state: 'wrong_tier', reason: "That code can't be used for this grade." });
    }
    if (found.max_uses && (found.times_used || 0) >= found.max_uses) {
      return Response.json({ state: 'exhausted', reason: 'That code has already been fully used.' });
    }

    // One grant per code per trader, ever.
    const prior = await base44.asServiceRole.entities.CodeRedemption.filter({ code, trader_id: trader.id });
    if ((prior || []).length > 0) {
      return Response.json({ state: 'already_used', reason: "You've already used that code." });
    }

    const now = new Date();
    const endsAt = new Date(now.getTime() + CYCLE_MONTHS * MONTH_MS).toISOString();

    await base44.asServiceRole.entities.CodeRedemption.create({
      code,
      trader_id: trader.id,
      user_email: trader.user_email || user.email,
      tier,
      redeemed_at: now.toISOString(),
      access_ends_at: endsAt,
    });
    await base44.asServiceRole.entities.DiscountCode.update(found.id, {
      times_used: (found.times_used || 0) + 1,
    });
    await base44.asServiceRole.entities.Trader.update(trader.id, {
      subscription_tier: tier,
      subscription_start_date: now.toISOString(),
      current_cycle_month: 1,
      plan_renews_at: endsAt,
      pending_tier: '',
      pending_tier_at: null,
      loyalty_years: 0,
      loyalty_bonus_listings: 0,
    });

    console.log(`code granted trader=${trader.id} tier=${tier} code=${code} until=${endsAt}`);

    return Response.json({ state: 'granted', tier, ends_at: endsAt });
  } catch (error: any) {
    console.error('redeemDiscountCode failed', error);
    return Response.json({ error: 'Could not check that code.' }, { status: 500 });
  }
}