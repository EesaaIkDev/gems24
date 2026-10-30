// Run: deno test --allow-env --allow-read --config tests/backend/deno.json tests/backend
import { assert, assertEquals } from 'jsr:@std/assert@1';
import { db, reset } from './mock.ts';
import storeWebhook from '../../base44/functions/storeWebhook/entry.ts';
import stampListing from '../../base44/functions/stampListing/entry.ts';
import { MONTH_MS, cycleMonth, effectiveLimit, tierFromProduct } from '../../base44/shared/traders.ts';

Deno.env.set('STORE_WEBHOOK_SECRET', 'shh');

const DAY = 864e5;
const store = async (event: Record<string, unknown>) => {
  const body = { event: { id: crypto.randomUUID(), app_user_id: 'T1', ...event } };
  const res = await storeWebhook(new Request('http://x', { method: 'POST', body: JSON.stringify(body), headers: { authorization: 'Bearer shh' } }));
  return res.json();
};
const trader = () => db.Trader.find((t) => t.id === 'T1')!;
const daysAgo = (d: number) => new Date(Date.now() - d * DAY).toISOString();
const individual = (extra: Record<string, unknown> = {}) => ({ id: 'T1', account_type: 'trader', trader_kind: 'individual', ...extra });

Deno.test('cycle: store product ids map to tiers', () => {
  assertEquals(tierFromProduct('gems24_gold_yearly'), 'gold');
  assertEquals(tierFromProduct('GEMS24_PLATINUM_YEARLY'), 'platinum');
  assertEquals(tierFromProduct('bronze'), 'bronze');
  assertEquals(tierFromProduct('gems24_diamond_yearly'), '');
  assertEquals(tierFromProduct('gems24_gold_monthly'), '');
});

Deno.test('cycle: 30-day months — days 0–29 → 1, 30–59 → 2, 60+ → 3', () => {
  const start = Date.UTC(2026, 0, 1);
  const iso = new Date(start).toISOString();
  assertEquals(cycleMonth(iso, start), 1);
  assertEquals(cycleMonth(iso, start + 29.9 * DAY), 1);
  assertEquals(cycleMonth(iso, start + 30 * DAY), 2);
  assertEquals(cycleMonth(iso, start + 59.9 * DAY), 2);
  assertEquals(cycleMonth(iso, start + 60 * DAY), 3);
  assertEquals(cycleMonth(iso, start + 200 * DAY), 3, 'renewals stay at month 3');
  assertEquals(cycleMonth(null), 0);
});

Deno.test('cycle: slots build up per tier — 2/4/6, 4/8/12, 6/12/18, 10/20/30', () => {
  const start = Date.UTC(2026, 0, 1);
  const at = (tier: string, month: number, extra: Record<string, unknown> = {}) =>
    effectiveLimit(
      { account_type: 'trader', subscription_tier: tier, subscription_start_date: new Date(start).toISOString(), ...extra },
      start + (month - 1) * MONTH_MS + DAY
    );
  assertEquals([1, 2, 3].map((m) => at('bronze', m)), [2, 4, 6]);
  assertEquals([1, 2, 3].map((m) => at('silver', m)), [4, 8, 12]);
  assertEquals([1, 2, 3].map((m) => at('gold', m)), [6, 12, 18]);
  assertEquals([1, 2, 3].map((m) => at('platinum', m)), [10, 20, 30]);
  assertEquals(at('gold', 1, { referral_bonus_listings: 12, loyalty_bonus_listings: 6 }), 24, 'bonuses add on top');
  assertEquals(at('gold', 2, { pending_tier: 'bronze' }), 4, 'a scheduled downgrade already applies');
  assertEquals(at('none', 3, { referral_bonus_listings: 5 }), 0, 'no plan, no slots');
});

Deno.test('cycle: an unrenewed cycle stops counting after the grace period', () => {
  const t = { account_type: 'trader', subscription_tier: 'gold', subscription_start_date: daysAgo(95), plan_renews_at: daysAgo(5) };
  assertEquals(effectiveLimit(t), 0);
  assertEquals(effectiveLimit({ ...t, plan_renews_at: daysAgo(1) }), 18, 'still inside store billing retry');
});

Deno.test('cycle: first purchase stores tier, start date and month 1', async () => {
  reset();
  db.Trader = [individual({ subscription_tier: 'none' })];
  const purchased = Date.now() - DAY;
  await store({ type: 'INITIAL_PURCHASE', product_id: 'gems24_gold_yearly', purchased_at_ms: purchased, expiration_at_ms: purchased + 90 * DAY });
  assertEquals(trader().subscription_tier, 'gold');
  assertEquals(trader().subscription_start_date, new Date(purchased).toISOString());
  assertEquals(trader().current_cycle_month, 1);
  assertEquals(effectiveLimit(trader()), 6);
});

Deno.test('cycle: renewal keeps the start date, stays at month 3 and adds loyalty', async () => {
  reset();
  db.Trader = [individual({ subscription_tier: 'gold', subscription_start_date: daysAgo(90), loyalty_years: 1, loyalty_bonus_listings: 0 })];
  const started = trader().subscription_start_date;
  await store({ type: 'RENEWAL', product_id: 'gems24_gold_yearly', expiration_at_ms: Date.now() + 90 * DAY });
  assertEquals(trader().subscription_start_date, started);
  assertEquals(trader().current_cycle_month, 3);
  assertEquals(trader().loyalty_bonus_listings, 6);
  assertEquals(effectiveLimit(trader()), 24);
});

Deno.test('cycle: a plan from before the cycle renews at month 3, not month 1', async () => {
  reset();
  db.Trader = [individual({ subscription_tier: 'silver', loyalty_years: 2 })];
  await store({ type: 'RENEWAL', product_id: 'gems24_silver_yearly', expiration_at_ms: Date.now() + 90 * DAY });
  assertEquals(trader().current_cycle_month, 3);
  assertEquals(cycleMonth(trader().subscription_start_date), 3);
});

Deno.test('cycle: mid-cycle upgrade keeps the month clock', async () => {
  reset();
  db.Trader = [individual({ subscription_tier: 'bronze', subscription_start_date: daysAgo(40), loyalty_years: 1 })];
  await store({ type: 'RENEWAL', product_id: 'gems24_gold_yearly', expiration_at_ms: Date.now() + 50 * DAY });
  assertEquals(trader().subscription_tier, 'gold');
  assertEquals(trader().current_cycle_month, 2);
  assertEquals(effectiveLimit(trader()), 12);
});

Deno.test('cycle: expiration resets to the free limit', async () => {
  reset();
  db.Trader = [individual({ subscription_tier: 'gold', subscription_start_date: daysAgo(90), current_cycle_month: 3, loyalty_years: 2, loyalty_bonus_listings: 6 })];
  await store({ type: 'EXPIRATION', product_id: 'gems24_gold_yearly' });
  assertEquals(trader().subscription_tier, 'none');
  assertEquals(trader().subscription_start_date, null);
  assertEquals(trader().current_cycle_month, 0);
  assertEquals(effectiveLimit(trader()), 0);
});

Deno.test('cycle: month 1 Gold can publish 6, not a 7th', async () => {
  reset();
  db.Trader = [individual({ full_name: 'Al', created_by_id: 'u1', subscription_tier: 'gold', subscription_start_date: daysAgo(3) })];
  db.Listing = Array.from({ length: 7 }, (_, i) => ({ id: `L${i}`, trader_id: 'T1', created_by_id: 'u1', status: 'available' }));
  await stampListing(new Request('http://x', { method: 'POST', body: JSON.stringify({ listing_id: 'L6', event_type: 'create' }) }));
  assert(!db.Listing.some((l) => l.id === 'L6'));
  assertEquals(db.Listing.length, 6);
});
