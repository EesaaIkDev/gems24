import { CYCLE_MONTHS, LOYALTY_STEP, MONTH_MS, cycleMonth, tierRank } from './traders.ts';

export const toIso = (ms: unknown) => {
  const n = Number(ms);
  return Number.isFinite(n) && n > 0 ? new Date(n).toISOString() : '';
};

/**
 * Puts a paid grade on a trader. Shared by storeWebhook (store events) and
 * syncStorePurchase (a direct check with RevenueCat right after checkout), so
 * both paths apply a purchase identically. Returns the loyalty slots granted.
 */
export async function applyTierGrant(
  base44: any,
  row: any,
  tier: string,
  opts: { eventType: string; purchasedAtMs?: unknown; expirationAtMs?: unknown }
) {
  const now = new Date().toISOString();
  const current = row.subscription_tier || 'none';
  const hadPlan = tierRank(current) > 0;
  // A higher grade while already on a plan is a mid-cycle upgrade: live now,
  // and it doesn't count as another loyalty renewal.
  const isUpgrade = hadPlan && tierRank(tier) > tierRank(current);
  // The same purchase can reach us twice (the direct check, then the webhook);
  // a first purchase of the grade already held is not another renewal.
  const alreadyApplied = opts.eventType === 'INITIAL_PURCHASE' && tier === current;
  let listingsGranted = 0;
  const update: Record<string, unknown> = { subscription_tier: tier };
  const renewsAt = toIso(opts.expirationAtMs);
  if (renewsAt) update.plan_renews_at = renewsAt;
  // The month clock starts with a fresh subscription and keeps running through
  // upgrades and renewals. Subscribers from before the 3-month cycle have no
  // start date and are already fully built up, so they continue at month 3.
  const startedAt = !hadPlan
    ? toIso(opts.purchasedAtMs) || now
    : row.subscription_start_date || new Date(Date.now() - (CYCLE_MONTHS - 1) * MONTH_MS).toISOString();
  update.subscription_start_date = startedAt;
  update.current_cycle_month = cycleMonth(startedAt);
  if (row.pending_tier && opts.eventType !== 'UNCANCELLATION' && !alreadyApplied) {
    update.pending_tier = '';
    update.pending_tier_at = null;
  }
  if (!hadPlan || !row.loyalty_years) {
    update.loyalty_years = 1;
    update.loyalty_bonus_listings = 0;
  } else if (!isUpgrade && !alreadyApplied && (opts.eventType === 'RENEWAL' || opts.eventType === 'INITIAL_PURCHASE')) {
    // Each uninterrupted 3-month renewal adds one month's worth of slots.
    listingsGranted = LOYALTY_STEP[tier] || 0;
    update.loyalty_years = (row.loyalty_years || 1) + 1;
    update.loyalty_bonus_listings = (row.loyalty_bonus_listings || 0) + listingsGranted;
  }
  await base44.asServiceRole.entities.Trader.update(row.id, update);
  return listingsGranted;
}