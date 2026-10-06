import { createClientFromRequest } from 'npm:@base44/sdk@0.8.44';
import { LOYALTY_STEP, TIER_KEYS, tierRank } from '../../shared/traders.ts';

/**
 * Applies a store purchase. This is the only thing in the system allowed to set
 * subscription_tier or purchased_listings from a payment.
 *
 * Shaped for a RevenueCat webhook (app_user_id carries the trader id, passed as
 * external_id when the paywall is launched), but the payload it reads is small
 * and generic, so any store provider can be pointed at it.
 *
 * Delivery is assumed at-least-once, so handling is idempotent: one grant per
 * event id, repeats acknowledged with 200.
 *
 * Secrets required (backend environment only):
 *   STORE_WEBHOOK_SECRET — sent by the provider in the Authorization header
 */

// A tier product/entitlement is named after the tier. An extra-listings product
// is named extra_listings_<count>, e.g. extra_listings_5.
const EXTRA_LISTINGS = /^extra_listings_(\d{1,3})$/i;

// PRODUCT_CHANGE is informational only (RevenueCat): the switch itself arrives
// later as RENEWAL (App Store) or INITIAL_PURCHASE (Google Play). It's used to
// record a scheduled downgrade, never to grant.
const GRANTING_EVENTS = ['INITIAL_PURCHASE', 'RENEWAL', 'NON_RENEWING_PURCHASE', 'UNCANCELLATION'];
const REVOKING_EVENTS = ['EXPIRATION', 'REFUND', 'SUBSCRIPTION_PAUSED'];

const toIso = (ms: unknown) => {
  const n = Number(ms);
  return Number.isFinite(n) && n > 0 ? new Date(n).toISOString() : '';
};

const env = (key: string): string | undefined =>
  (globalThis as any).Deno?.env?.get(key) ?? undefined;

/** Value-constant comparison so the secret is not leaked byte by byte. */
function safeEqual(a: string, b: string): boolean {
  if (a.length !== b.length) return false;
  let diff = 0;
  for (let i = 0; i < a.length; i++) diff |= a.charCodeAt(i) ^ b.charCodeAt(i);
  return diff === 0;
}

export default async function (req: Request): Promise<Response> {
  try {
    const secret = env('STORE_WEBHOOK_SECRET');
    if (!secret) {
      console.error('storeWebhook: STORE_WEBHOOK_SECRET is not set');
      return Response.json({ error: 'Not configured' }, { status: 500 });
    }

    const provided = (req.headers.get('authorization') || '').replace(/^Bearer\s+/i, '').trim();
    if (!provided || !safeEqual(provided, secret)) {
      console.warn('storeWebhook: rejected payload with bad or missing secret');
      return Response.json({ error: 'Unauthorized' }, { status: 401 });
    }

    let payload: any;
    try {
      payload = await req.json();
    } catch {
      return Response.json({ error: 'Malformed payload' }, { status: 400 });
    }

    const event = payload?.event ?? payload;
    const eventId = String(event?.id || event?.event_id || '');
    const eventType = String(event?.type || event?.event_type || '').toUpperCase();
    const traderId = String(event?.app_user_id || event?.external_id || event?.trader_id || '');
    const productId = String(event?.product_id || event?.entitlement_id || '');

    if (!eventId || !traderId) {
      return Response.json({ ok: true, ignored: true });
    }

    const base44 = createClientFromRequest(req);

    const seen = await base44.asServiceRole.entities.StorePurchase.filter({ event_id: eventId });
    if ((seen || []).length > 0) {
      return Response.json({ ok: true, duplicate: true });
    }

    const trader = await base44.asServiceRole.entities.Trader.filter({ id: traderId });
    const row = trader?.[0] ?? null;
    if (!row) {
      console.warn(`storeWebhook: no trader for app_user_id=${traderId}`);
      return Response.json({ ok: true, unmatched: true });
    }
    if (row.account_type !== 'trader') {
      // Buyer accounts can't hold a subscription tier — never grant, even if the
      // store somehow billed one (e.g. a stale paywall link).
      console.warn(`storeWebhook: refusing tier grant for non-trader account trader=${row.id}`);
      return Response.json({ ok: true, ignored: true });
    }

    const now = new Date().toISOString();
    const extra = EXTRA_LISTINGS.exec(productId);
    const tier = TIER_KEYS.includes(productId.toLowerCase()) ? productId.toLowerCase() : '';

    let kind = 'ignored';
    let listingsGranted = 0;
    let appliedTier = '';

    if (extra && GRANTING_EVENTS.includes(eventType)) {
      // Bought outright — these never expire, so a later expiry never removes them.
      listingsGranted = Math.min(50, parseInt(extra[1], 10) || 0);
      kind = 'extra_listings';
      await base44.asServiceRole.entities.Trader.update(row.id, {
        purchased_listings: (row.purchased_listings || 0) + listingsGranted,
      });
    } else if (tier && GRANTING_EVENTS.includes(eventType)) {
      kind = 'tier';
      appliedTier = tier;
      const current = row.subscription_tier || 'none';
      const hadPlan = tierRank(current) > 0;
      // A higher grade while already on a plan is a mid-year upgrade: live now,
      // and it doesn't count as another loyalty year.
      const isUpgrade = hadPlan && tierRank(tier) > tierRank(current);
      const update: Record<string, unknown> = { subscription_tier: tier };
      const renewsAt = toIso(event?.expiration_at_ms);
      if (renewsAt) update.plan_renews_at = renewsAt;
      // Any grade change (an upgrade, or the plan year rolling over) settles a
      // scheduled downgrade one way or the other.
      if (row.pending_tier && eventType !== 'UNCANCELLATION') {
        update.pending_tier = '';
        update.pending_tier_at = null;
      }
      if (!hadPlan || !row.loyalty_years) {
        // A fresh (or first-seen) subscription starts year one with no loyalty bonus.
        update.loyalty_years = 1;
        update.loyalty_bonus_listings = 0;
      } else if (!isUpgrade && (eventType === 'RENEWAL' || eventType === 'INITIAL_PURCHASE')) {
        // Plans bill annually: a same-grade renewal, or a scheduled downgrade
        // landing at the anniversary, is another uninterrupted year.
        const years = (row.loyalty_years || 1) + 1;
        listingsGranted = (LOYALTY_STEP[tier] || 0) * (years - 1);
        update.loyalty_years = years;
        update.loyalty_bonus_listings = (row.loyalty_bonus_listings || 0) + listingsGranted;
      }
      await base44.asServiceRole.entities.Trader.update(row.id, update);
    } else if (eventType === 'PRODUCT_CHANGE') {
      const next = String(event?.new_product_id || '').toLowerCase();
      if (TIER_KEYS.includes(next) && tierRank(next) < tierRank(row.subscription_tier)) {
        // Downgrade: the trader keeps their grade until the plan year ends.
        kind = 'tier';
        appliedTier = `pending:${next}`;
        const at = toIso(event?.expiration_at_ms) || row.plan_renews_at || null;
        await base44.asServiceRole.entities.Trader.update(row.id, {
          pending_tier: next,
          pending_tier_at: at,
          ...(at ? { plan_renews_at: at } : {}),
        });
      } else if (TIER_KEYS.includes(next) && row.pending_tier) {
        // Switched back up (or to the same grade) before the downgrade landed.
        kind = 'tier';
        appliedTier = 'pending:cleared';
        await base44.asServiceRole.entities.Trader.update(row.id, { pending_tier: '', pending_tier_at: null });
      }
    } else if (tier && REVOKING_EVENTS.includes(eventType) && tier === row.subscription_tier) {
      // Only the grade the trader is actually on can lapse — an upgrade on
      // Google Play retires the old product, and that expiry must not wipe the
      // new plan.
      kind = 'tier';
      appliedTier = 'none';
      // Letting the plan lapse ends the streak and its loyalty listings.
      await base44.asServiceRole.entities.Trader.update(row.id, {
        subscription_tier: 'none',
        plan_renews_at: null,
        pending_tier: '',
        pending_tier_at: null,
        loyalty_years: 0,
        loyalty_bonus_listings: 0,
      });
    }

    await base44.asServiceRole.entities.StorePurchase.create({
      event_id: eventId,
      trader_id: row.id,
      event_type: eventType,
      product_id: productId,
      kind,
      tier: appliedTier,
      listings_granted: listingsGranted,
      applied_at: now,
    });

    console.log(
      `storeWebhook ${eventType} trader=${row.id} product=${productId} kind=${kind} listings=${listingsGranted}`
    );

    return Response.json({ ok: true, kind });
  } catch (error: any) {
    // A non-200 makes the provider retry, which is what we want for a transient fault.
    console.error('storeWebhook failed', error);
    return Response.json({ error: 'Webhook processing failed' }, { status: 500 });
  }
}