export const LOGO_URL = "https://media.base44.com/images/public/6a661583e07cf311ecceee39/497267ee2_Gems24-logo.png";

/**
 * Plans bill every 3 months and slots build up month by month (30 days each):
 * `monthly` × the cycle month, so `limit` (month 3) is the full allocation.
 * Mirrors MONTHLY_SLOTS in base44/shared/traders.ts, which is what's enforced.
 */
export const CYCLE_MONTHS = 3;
const MONTH_MS = 30 * 24 * 60 * 60 * 1000;
const LAPSE_GRACE_MS = 2 * 24 * 60 * 60 * 1000;

export const TIERS = {
  none: { key: "none", label: "Free", monthly: 0, limit: 0, rank: 0, price: null },
  bronze: { key: "bronze", label: "Bronze", monthly: 2, limit: 6, rank: 1, price: 9 },
  silver: { key: "silver", label: "Silver", monthly: 4, limit: 12, rank: 2, price: 29 },
  gold: { key: "gold", label: "Gold", monthly: 6, limit: 18, rank: 3, price: 69 },
  platinum: { key: "platinum", label: "Platinum", monthly: 10, limit: 30, rank: 4, price: 199 },
};

/** Month of the 3-month cycle (1–3), or 0 with no start date. Days 0–29 → 1, 30–59 → 2, 60+ → 3. */
export function cycleMonth(startDate, now = Date.now()) {
  const start = Date.parse(startDate || "");
  if (!Number.isFinite(start)) return 0;
  return Math.min(CYCLE_MONTHS, Math.max(0, Math.floor((now - start) / MONTH_MS)) + 1);
}

/** Cycle month the trader's slots are counted at; plans from before the cycle count as month 3. */
export const traderCycleMonth = (t) => cycleMonth(t?.subscription_start_date) || CYCLE_MONTHS;

/** When the next month's slots unlock, or null once the cycle is fully built up. */
export function nextSlotsAt(t) {
  const start = Date.parse(t?.subscription_start_date || "");
  const month = cycleMonth(t?.subscription_start_date);
  if (!Number.isFinite(start) || !month || month >= CYCLE_MONTHS) return null;
  return new Date(start + month * MONTH_MS);
}

/** The cycle ended (plus store retry grace) without a renewal. */
export const planLapsed = (t) => {
  const ends = Date.parse(t?.plan_renews_at || "");
  return Number.isFinite(ends) && Date.now() > ends + LAPSE_GRACE_MS;
};

/** Referral reward scales with the grade of the trader handing out the code. */
export const REFERRAL_BONUS = { bronze: 5, silver: 8, gold: 12, platinum: 20 };

/** Loyalty listings: every uninterrupted 3-month renewal adds one month's worth of slots. Mirrors the server. */
export const LOYALTY_STEP = { bronze: 2, silver: 4, gold: 6, platinum: 10 };

/** Referrals are a growth lever, not a plan replacement — twice a year each. */
export const REFERRALS_PER_YEAR = 2;


// Highest grade first: Platinum anchors the price scale so Gold reads as the
// reasonable choice rather than the expensive end of a build-up from Bronze.
export const TIER_ORDER = ["platinum", "gold", "silver", "bronze"];

// Soft UI: badges share the surface colour, so tiers read through text colour.
export const TIER_STYLES = {
  bronze: "text-[#9c5a1c] dark:text-[#e0a56d]",
  silver: "text-slate-500 dark:text-slate-300",
  gold: "text-[#9a7900] dark:text-[#f0d264]",
  platinum: "text-slate-600 dark:text-slate-200",
};

export const GEM_TYPES = ["sapphire", "ruby", "emerald", "spinel", "garnet", "other"];
export const TREATMENTS = ["heated", "unheated", "other"];

export const isBusiness = (t) => t?.account_type === "trader" && t?.trader_kind === "business";

/** Platinum is the business plan; individual traders choose Bronze–Gold (Gold is their top plan). */
export const plansFor = (t) => (isBusiness(t) ? ["platinum"] : ["gold", "silver", "bronze"]);

export const BUSINESS_TYPES = [
  { value: "sole_proprietorship", label: "Sole proprietorship" },
  { value: "partnership", label: "Partnership" },
  { value: "private_limited", label: "Private limited company" },
  { value: "public_limited", label: "Public limited company" },
  { value: "other", label: "Other" },
];
export const TEAM_SIZES = ["1", "2-10", "11-50", "51-200", "200+"];
export const businessTypeLabel = (v) => BUSINESS_TYPES.find((b) => b.value === v)?.label || "";

export const tierRank = (t) => TIERS[t || "none"]?.rank ?? 0;
export const tierLimit = (t) => TIERS[t || "none"]?.limit ?? 0;
export const cap = (s) => (s ? s.charAt(0).toUpperCase() + s.slice(1) : "");
export const byTier = (a, b) => tierRank(b.trader_tier || b.subscription_tier) - tierRank(a.trader_tier || a.subscription_tier);