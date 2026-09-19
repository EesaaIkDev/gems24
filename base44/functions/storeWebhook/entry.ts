import { createClientFromRequest } from 'npm:@base44/sdk@0.8.44';
import { TIER_KEYS } from '../../shared/traders.ts';

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

const GRANTING_EVENTS = [
  'INITIAL_PURCHASE',
  'RENEWAL',
  'PRODUCT_CHANGE',
  'NON_RENEWING_PURCHASE',
  'UNCANCELLATION',
];
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
      await base44.asServiceRole.entities.Trader.update(row.id, { subscription_tier: tier });
    } else if (tier && REVOKING_EVENTS.includes(eventType)) {
      kind = 'tier';
      appliedTier = 'none';
      await base44.asServiceRole.entities.Trader.update(row.id, { subscription_tier: 'none' });
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