import { createClientFromRequest } from 'npm:@base44/sdk@0.8.54';
import { secrets } from 'base44:runtime';
import { restampListings, sessionTrader, tierAllowed, tierFromProduct, tierRank } from '../../shared/traders.ts';
import { applyTierGrant } from '../../shared/storeGrant.ts';

/**
 * Called by the app right after the store says "You're all set". Asks
 * RevenueCat directly (server to server, secret key) which plan the caller's
 * trader holds and applies it, so the grade goes live without waiting for the
 * webhook. The client only names nothing: the trader comes from the session
 * and the plan from RevenueCat.
 */
export default async function (req: Request): Promise<Response> {
  try {
    const base44 = createClientFromRequest(req);
    const { user, trader } = await sessionTrader(base44);
    if (!user) return Response.json({ error: 'Unauthorized' }, { status: 401 });
    if (!trader || trader.account_type !== 'trader') return Response.json({ tier: 'none', changed: false });

    const res = await fetch(`https://api.revenuecat.com/v1/subscribers/${encodeURIComponent(trader.id)}`, {
      headers: { Authorization: `Bearer ${secrets.get('REVENUECAT_SECRET_KEY')}` },
      signal: AbortSignal.timeout(10000),
    });
    if (!res.ok) {
      console.error('syncStorePurchase: RevenueCat', res.status, await res.text());
      return Response.json({ error: 'Store check failed' }, { status: 502 });
    }
    const subs = (await res.json())?.subscriber?.subscriptions || {};

    // Highest active plan this trader may hold.
    const now = Date.now();
    let best: { tier: string; productId: string; sub: any } | null = null;
    for (const [productId, sub] of Object.entries<any>(subs)) {
      const tier = tierFromProduct(productId);
      const expires = Date.parse(sub?.expires_date || '');
      if (!tier || sub?.refunded_at || !(expires > now) || !tierAllowed(trader, tier)) continue;
      if (!best || tierRank(tier) > tierRank(best.tier)) best = { tier, productId, sub };
    }

    const current = trader.subscription_tier || 'none';
    if (!best || tierRank(best.tier) <= tierRank(current)) {
      return Response.json({ tier: current, changed: false });
    }

    const purchasedAt = Date.parse(best.sub.purchase_date || '');
    const expiresAt = Date.parse(best.sub.expires_date);
    await applyTierGrant(base44, trader, best.tier, {
      eventType: 'INITIAL_PURCHASE',
      purchasedAtMs: purchasedAt,
      expirationAtMs: expiresAt,
    });
    const updated = { ...trader, subscription_tier: best.tier };
    await restampListings(base44, updated);
    await base44.asServiceRole.entities.StorePurchase.create({
      event_id: `sync:${trader.id}:${best.productId}:${best.sub.purchase_date || ''}`,
      trader_id: trader.id,
      event_type: 'SYNC',
      product_id: best.productId,
      kind: 'tier',
      tier: best.tier,
      listings_granted: 0,
      applied_at: new Date().toISOString(),
      trader_name: trader.full_name || '',
      business_name: trader.business_name || trader.legal_business_name || '',
      trader_kind: trader.trader_kind || 'individual',
      user_email: trader.user_email || '',
      country: trader.country || '',
      store: String(best.sub.store || ''),
    });
    console.log(`syncStorePurchase trader=${trader.id} ${current} -> ${best.tier}`);
    return Response.json({ tier: best.tier, changed: true });
  } catch (error: any) {
    console.error('syncStorePurchase failed', error);
    return Response.json({ error: 'Store check failed' }, { status: 500 });
  }
}