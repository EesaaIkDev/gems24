/**
 * Shared trader/entitlement helpers for the backend functions that grant paid
 * benefits. Entitlements (subscription_tier, purchased_listings,
 * referral_bonus_listings) are server-managed: the client never writes them, so
 * every grant path goes through one of these helpers.
 */

export const TIER_KEYS = ['bronze', 'silver', 'gold', 'platinum'];

/** Referral reward scales with the grade of the trader handing out the code. */
export const REFERRAL_BONUS: Record<string, number> = {
  bronze: 5,
  silver: 8,
  gold: 12,
  platinum: 20,
};

/** Referrals are a growth lever, not a plan replacement — twice a year each. */
export const REFERRALS_PER_YEAR = 2;

export const YEAR_MS = 365 * 24 * 60 * 60 * 1000;

export const tierRank = (tier: string) => TIER_KEYS.indexOf(String(tier || '')) + 1;

/**
 * The caller's own trader row, resolved from the authenticated session. The
 * client never supplies a trader id — that is what let a browser grant
 * entitlements to any row it liked.
 */
export async function callerTrader(base44: any, email: string) {
  const rows = await base44.asServiceRole.entities.Trader.filter({ user_email: email });
  return rows?.[0] ?? null;
}

/** Referrals used inside the trader's current 12-month window. */
export function referralsUsedThisYear(trader: any) {
  const start = trader?.referral_year_start ? new Date(trader.referral_year_start).getTime() : 0;
  if (!start || Date.now() - start >= YEAR_MS) return 0;
  return trader?.referral_count_year || 0;
}