import { createClientFromRequest } from 'npm:@base44/sdk@0.8.44';
import {
  REFERRALS_PER_YEAR,
  REFERRAL_BONUS,
  callerTrader,
  referralsUsedThisYear,
  tierRank,
} from '../../shared/traders.ts';

/**
 * Credits a referral to the owner of `code` and grants their bonus listing
 * slots. The only path allowed to write referral counters or
 * referral_bonus_listings.
 *
 * Previously the browser wrote both the Referral row and the referrer's
 * counters, so the annual cap was advisory and bonus slots could be minted at
 * will. Everything is now decided here from the authenticated caller: the client
 * submits a code and nothing else.
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
    if (!code) return Response.json({ state: 'invalid' });

    // The referred trader is always the caller — never a client-supplied id.
    const newTrader = await callerTrader(base44, user.email);
    if (!newTrader) {
      return Response.json({ error: 'No trader profile found' }, { status: 404 });
    }
    if (newTrader.referred_by_code) {
      return Response.json({ state: 'already_referred' });
    }

    // Idempotency: a retry must not credit the same signup twice.
    const existing = await base44.asServiceRole.entities.Referral.filter({
      referred_trader_id: newTrader.id,
    });
    if ((existing || []).length > 0) {
      return Response.json({ state: 'already_referred' });
    }

    const referrer =
      (await base44.asServiceRole.entities.Trader.filter({ referral_code: code }))?.[0] ?? null;
    // Only traders on a plan hand out working codes.
    if (!referrer || tierRank(referrer.subscription_tier) === 0) {
      return Response.json({ state: 'invalid' });
    }
    if (referrer.id === newTrader.id) {
      return Response.json({ state: 'invalid' });
    }

    const used = referralsUsedThisYear(referrer);
    if (used >= REFERRALS_PER_YEAR) {
      return Response.json({ state: 'cap_reached' });
    }

    const granted = REFERRAL_BONUS[referrer.subscription_tier] || 0;
    // A fresh window opens on the first referral after the previous year lapsed.
    const yearStart = used === 0 ? new Date().toISOString() : referrer.referral_year_start;

    await base44.asServiceRole.entities.Trader.update(newTrader.id, { referred_by_code: code });
    await base44.asServiceRole.entities.Referral.create({
      referrer_id: referrer.id,
      code,
      referred_trader_id: newTrader.id,
      referred_email: newTrader.user_email || user.email,
      bonus_granted: granted,
    });
    await base44.asServiceRole.entities.Trader.update(referrer.id, {
      referral_count: (referrer.referral_count || 0) + 1,
      referral_bonus_listings: (referrer.referral_bonus_listings || 0) + granted,
      referral_count_year: used + 1,
      referral_year_start: yearStart,
    });

    console.log(`referral credited referrer=${referrer.id} new=${newTrader.id} bonus=${granted}`);

    return Response.json({ state: 'credited', bonusGranted: granted });
  } catch (error: any) {
    console.error('redeemReferral failed', error);
    return Response.json({ error: 'Could not apply that code.' }, { status: 500 });
  }
}