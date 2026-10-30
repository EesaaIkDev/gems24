/**
 * Shared trader/entitlement helpers for the backend functions that grant paid
 * benefits. Entitlements (subscription_tier,
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
 * Loyalty listings: each uninterrupted 3-month renewal adds one month's worth
 * of slots (a flat amount per renewal). Reset when the plan lapses.
 */
export const LOYALTY_STEP: Record<string, number> = {
  bronze: 2,
  silver: 4,
  gold: 6,
  platinum: 10,
};

/**
 * Plans bill every 3 months. Slots build up month by month (30 days each):
 * month 1 = 1×, month 2 = 2×, month 3 = 3× the tier's monthly allocation, and
 * renewals stay at month 3.
 */
export const MONTHLY_SLOTS: Record<string, number> = {
  none: 0,
  bronze: 2,
  silver: 4,
  gold: 6,
  platinum: 10,
};
export const CYCLE_MONTHS = 3;
export const MONTH_MS = 30 * 24 * 60 * 60 * 1000;
/** Store billing retries after the cycle ends before an unrenewed plan stops counting. */
export const LAPSE_GRACE_MS = 2 * 24 * 60 * 60 * 1000;

/** Store product → tier: `gems24_<tier>_yearly` (the store ids), or the bare tier key. */
export function tierFromProduct(productId: string) {
  const id = String(productId || '').toLowerCase();
  if (TIER_KEYS.includes(id)) return id;
  const m = id.match(/^gems24_([a-z]+)_yearly$/);
  return m && TIER_KEYS.includes(m[1]) ? m[1] : '';
}

/** Month of the 3-month cycle (1–3) at `now`, or 0 with no start date. Days 0–29 → 1, 30–59 → 2, 60+ → 3. */
export function cycleMonth(startDate: string | null | undefined, now = Date.now()) {
  const start = Date.parse(startDate || '');
  if (!Number.isFinite(start)) return 0;
  return Math.min(CYCLE_MONTHS, Math.max(0, Math.floor((now - start) / MONTH_MS)) + 1);
}

export const YEAR_MS = 365 * 24 * 60 * 60 * 1000;

export const tierRank = (tier: string) => TIER_KEYS.indexOf(String(tier || '')) + 1;

export const isBusiness = (t: any) => t?.account_type === 'trader' && t?.trader_kind === 'business';

/** Platinum is the business plan; Bronze–Gold are for individual traders (Gold is their top plan). */
export const tierAllowed = (t: any, tier: string) =>
  t?.account_type === 'trader' && TIER_KEYS.includes(tier) && (tier === 'platinum') === isBusiness(t);

export const BUSINESS_TYPES = ['sole_proprietorship', 'partnership', 'private_limited', 'public_limited', 'other'];
export const TEAM_SIZES = ['1', '2-10', '11-50', '51-200', '200+'];

/**
 * Cleans the business details a user submits. Returns { fields } or { error }.
 * No documents here — KYB happens later through Shufti.
 */
export function businessFields(input: any) {
  const text = (v: unknown, max: number) => String(v ?? '').trim().slice(0, max);
  const legal = text(input?.legal_business_name, 120);
  if (legal.length < 2) return { error: 'Enter your registered business name.' };
  const type = text(input?.business_type, 40);
  const size = text(input?.team_size, 10);
  const year = Number(input?.year_founded);
  const thisYear = new Date().getUTCFullYear();
  let website = text(input?.website, 200);
  if (website && !/^https?:\/\//i.test(website)) website = `https://${website}`;
  try {
    if (website) new URL(website);
  } catch {
    return { error: 'That website address doesn\'t look right.' };
  }
  return {
    fields: {
      legal_business_name: legal,
      business_name: text(input?.business_name, 120) || legal,
      business_type: BUSINESS_TYPES.includes(type) ? type : '',
      registration_number: text(input?.registration_number, 60),
      year_founded: Number.isInteger(year) && year >= 1800 && year <= thisYear ? year : null,
      team_size: TEAM_SIZES.includes(size) ? size : '',
      website,
      contact_role: text(input?.contact_role, 60),
    },
  };
}

/** Stones on the market at once per grade. Mirrors TIERS in src/lib/gems.js. */
/** Full (month-3) allocation per tier. */
export const TIER_LIMIT: Record<string, number> = Object.fromEntries(
  Object.entries(MONTHLY_SLOTS).map(([t, n]) => [t, n * CYCLE_MONTHS])
);

/** A plan whose cycle ended (plus grace) without a renewal no longer counts. */
export const planLapsed = (trader: any, now = Date.now()) => {
  const ends = Date.parse(trader?.plan_renews_at || '');
  return Number.isFinite(ends) && now > ends + LAPSE_GRACE_MS;
};

/**
 * Listing capacity right now: the tier's monthly slots × the cycle month. While
 * a downgrade is scheduled the lower grade already applies, so a trader who
 * trimmed down can't refill before the switch lands.
 */
export function effectiveLimit(trader: any, now = Date.now()) {
  if (trader?.account_type !== 'trader' || planLapsed(trader, now)) return 0;
  const tiers = [trader.subscription_tier, trader.pending_tier].filter(Boolean);
  // Plans from before the 3-month cycle have no start date: treat them as fully built up.
  const month = cycleMonth(trader.subscription_start_date, now) || CYCLE_MONTHS;
  const base = Math.min(...tiers.map((t: string) => (MONTHLY_SLOTS[t] ?? 0) * month));
  if (!base) return 0;
  return (
    base +
    (trader.referral_bonus_listings || 0) +
    (trader.loyalty_bonus_listings || 0)
  );
}

export const isActiveListing = (l: any) => l?.status !== 'sold';

/** Verified badge only counts for the account type it was granted for. */
export const isVerified = (t: any) =>
  !!t?.verified && (!t.verified_as || t.verified_as === t.account_type);

/**
 * Sort key for marketplace order: higher grade first, newest first within a
 * grade. One number so the server can sort and paginate on it directly.
 */
export const placementScore = (tier: string, createdDate?: string) =>
  tierRank(tier) * 1e13 + (Date.parse(createdDate || '') || 0);

/** The fields a listing mirrors from its trader — always written server-side. */
export const listingStamp = (t: any, listing?: any) => ({
  // Businesses list under their company name; individuals under their own.
  trader_name: (isBusiness(t) && (t.business_name || t.legal_business_name)) || t?.full_name || '',
  trader_country: t?.country || '',
  trader_tier: t?.subscription_tier || 'none',
  trader_verified: isVerified(t),
  trader_verified_level: isVerified(t) ? t.verified_level || (t.account_type === 'buyer' ? 'buyer' : 'trader') : '',
  placement: placementScore(t?.subscription_tier, listing?.created_date),
});

/** Re-copies a trader's public details onto every listing they own. */
export async function restampListings(base44: any, trader: any) {
  const rows = await base44.asServiceRole.entities.Listing.filter({ trader_id: trader.id });
  for (const l of rows || []) {
    const stamp = listingStamp(trader, l);
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