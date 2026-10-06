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

/**
 * Loyalty listings: each uninterrupted annual renewal grants free slots, and
 * the grant grows every year — renewal N adds step × (N − 1). Platinum: +50 at
 * year 2, +100 at year 3, +150 at year 4 … Reset when the plan lapses.
 */
export const LOYALTY_STEP: Record<string, number> = {
  bronze: 10,
  silver: 15,
  gold: 30,
  platinum: 50,
};

export const YEAR_MS = 365 * 24 * 60 * 60 * 1000;

export const tierRank = (tier: string) => TIER_KEYS.indexOf(String(tier || '')) + 1;

/** Stones on the market at once per grade. Mirrors TIERS in src/lib/gems.js. */
export const TIER_LIMIT: Record<string, number> = {
  none: 0,
  bronze: 25,
  silver: 40,
  gold: 80,
  platinum: 300,
};

/**
 * Listing capacity right now. While a downgrade is scheduled the lower grade's
 * limit already applies, so a trader who trimmed down can't refill before the
 * switch lands.
 */
export function effectiveLimit(trader: any) {
  if (trader?.account_type !== 'trader') return 0;
  const tiers = [trader.subscription_tier, trader.pending_tier].filter(Boolean);
  const base = Math.min(...tiers.map((t: string) => TIER_LIMIT[t] ?? 0));
  if (!base) return 0;
  return (
    base +
    (trader.referral_bonus_listings || 0) +
    (trader.purchased_listings || 0) +
    (trader.loyalty_bonus_listings || 0)
  );
}

export const isActiveListing = (l: any) => l?.status !== 'sold';

/** Verified badge only counts for the account type it was granted for. */
export const isVerified = (t: any) =>
  !!t?.verified && (!t.verified_as || t.verified_as === t.account_type);

/** The fields a listing mirrors from its trader — always written server-side. */
export const listingStamp = (t: any) => ({
  trader_name: t?.full_name || '',
  trader_country: t?.country || '',
  trader_tier: t?.subscription_tier || 'none',
  trader_verified: isVerified(t),
});

/** Re-copies a trader's public details onto every listing they own. */
export async function restampListings(base44: any, trader: any) {
  const stamp = listingStamp(trader);
  const rows = await base44.asServiceRole.entities.Listing.filter({ trader_id: trader.id });
  for (const l of rows || []) {
    if (Object.entries(stamp).some(([k, v]) => l[k] !== v)) {
      await base44.asServiceRole.entities.Listing.update(l.id, stamp);
    }
  }
}

/** The caller's trader row from the authenticated session, or null. */
export async function sessionTrader(base44: any) {
  let user: any = null;
  try {
    user = await base44.auth.me();
  } catch {
    user = null;
  }
  if (!user?.email) return { user: null, trader: null };
  return { user, trader: await callerTrader(base44, user.email) };
}

/** The accepted (or any) connection row between two traders, if one exists. */
export async function connectionBetween(base44: any, a: string, b: string) {
  const [x, y] = await Promise.all([
    base44.asServiceRole.entities.Connection.filter({ requester_id: a, recipient_id: b }),
    base44.asServiceRole.entities.Connection.filter({ requester_id: b, recipient_id: a }),
  ]);
  return [...(x || []), ...(y || [])][0] ?? null;
}

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