import { createClientFromRequest } from 'npm:@base44/sdk@0.8.44';
import { tierAllowed, tierFromProduct, tierRank } from '../../shared/traders.ts';
import { applyTierGrant, toIso } from '../../shared/storeGrant.ts';

/**
 * Applies a store purchase. This is the only thing in the system allowed to set
 * subscription_tier from a payment.
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

// Store products are gems24_<tier>_yearly (billed every 3 months despite the
// name); a bare tier key is accepted too. See tierFromProduct.

// PRODUCT_CHANGE is informational only (RevenueCat): the switch itself arrives
// later as RENEWAL (App Store) or INITIAL_PURCHASE (Google Play). It's used to
// record a scheduled downgrade, never to grant.
const GRANTING_EVENTS = ['INITIAL_PURCHASE', 'RENEWAL', 'NON_RENEWING_PURCHASE', 'UNCANCELLATION'];
const REVOKING_EVENTS = ['EXPIRATION', 'REFUND', 'SUBSCRIPTION_PAUSED'];

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
  // Last step reached, logged on failure so a 500 points at the failing call.
  let stage = 'start';
  let eventInfo = '';
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

    eventInfo = `event=${eventId} type=${eventType} product=${productId}`;

    if (!eventId || !traderId) {
      return Response.json({ ok: true, ignored: true });
    }

    // The Authorization header carries the webhook secret, not a user session;
    // strip it so the SDK doesn't try to use it as a user token.
    const headers = new Headers(req.headers);
    headers.delete('authorization');
    const base44 = createClientFromRequest(new Request(req.url, { method: req.method, headers }));

    stage = 'duplicate-check';
    const seen = await base44.asServiceRole.entities.StorePurchase.filter({ event_id: eventId });
    if ((seen || []).length > 0) {
      return Response.json({ ok: true, duplicate: true });
    }

    // RevenueCat's dashboard "test event" uses a made-up user id, which isn't a
    // valid record id; treat it as unmatched rather than failing with a 500.
    stage = 'trader-lookup';
    const trader = await base44.asServiceRole.entities.Trader.filter({ id: traderId }).catch(() => []);
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
    const tier = tierFromProduct(productId);

    let kind = 'ignored';
    let listingsGranted = 0;
    let appliedTier = '';
    stage = 'trader-update';

    if (tier && GRANTING_EVENTS.includes(eventType) && !tierAllowed(row, tier)) {
      // Platinum is the business plan and Bronze–Gold are for individuals; a
      // stale paywall or a renewal after switching kind must not grant across.
      appliedTier = `refused:${tier}`;
      console.warn(`storeWebhook: refusing ${tier} for ${row.trader_kind || 'individual'} trader=${row.id}`);
    } else if (tier && GRANTING_EVENTS.includes(eventType)) {
      kind = 'tier';
      appliedTier = tier;
      listingsGranted = await applyTierGrant(base44, row, tier, {
        eventType,
        purchasedAtMs: event?.purchased_at_ms,
        expirationAtMs: event?.expiration_at_ms,
      });
    } else if (eventType === 'PRODUCT_CHANGE') {
      const next = tierFromProduct(String(event?.new_product_id || ''));
      if (next && tierAllowed(row, next) && tierRank(next) < tierRank(row.subscription_tier)) {
        // Downgrade: the trader keeps their grade until the plan year ends.
        kind = 'tier';
        appliedTier = `pending:${next}`;
        const at = toIso(event?.expiration_at_ms) || row.plan_renews_at || null;
        await base44.asServiceRole.entities.Trader.update(row.id, {
          pending_tier: next,
          pending_tier_at: at,
          ...(at ? { plan_renews_at: at } : {}),
        });
      } else if (next && row.pending_tier) {
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
        subscription_start_date: null,
        current_cycle_month: 0,
        pending_tier: '',
        pending_tier_at: null,
        loyalty_years: 0,
        loyalty_bonus_listings: 0,
      });
    }

    stage = 'purchase-record';
    await base44.asServiceRole.entities.StorePurchase.create({
      event_id: eventId,
      trader_id: row.id,
      event_type: eventType,
      product_id: productId,
      kind,
      tier: appliedTier,
      listings_granted: listingsGranted,
      applied_at: now,
      trader_name: row.full_name || '',
      business_name: row.business_name || row.legal_business_name || '',
      trader_kind: row.trader_kind || 'individual',
      user_email: row.user_email || '',
      country: row.country || '',
      // Omit a missing price rather than sending null into a number field.
      ...(typeof event?.price === 'number' ? { price: event.price } : {}),
      currency: String(event?.currency || ''),
      store: String(event?.store || ''),
    });

    console.log(
      `storeWebhook ${eventType} trader=${row.id} product=${productId} kind=${kind} listings=${listingsGranted}`
    );

    return Response.json({ ok: true, kind });
  } catch (error: any) {
    // A non-200 makes the provider retry, which is what we want for a transient fault.
    console.error(
      `storeWebhook failed at stage=${stage} ${eventInfo} status=${error?.status ?? ''} message=${error?.message ?? error}`
    );
    return Response.json({ error: 'Webhook processing failed' }, { status: 500 });
  }
}