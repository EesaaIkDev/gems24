export const LOGO_URL = "https://media.base44.com/images/public/6a661583e07cf311ecceee39/497267ee2_Gems24-logo.png";

export const TIERS = {
  none: { key: "none", label: "Free", limit: 0, rank: 0, price: null },
  bronze: { key: "bronze", label: "Bronze", limit: 25, rank: 1, price: 9 },
  silver: { key: "silver", label: "Silver", limit: 40, rank: 2, price: 29 },
  gold: { key: "gold", label: "Gold", limit: 80, rank: 3, price: 59 },
  platinum: { key: "platinum", label: "Platinum", limit: 300, rank: 4, price: 199 },
};

/** Referral reward scales with the grade of the trader handing out the code. */
export const REFERRAL_BONUS = { bronze: 5, silver: 8, gold: 12, platinum: 20 };

/** Referrals are a growth lever, not a plan replacement — twice a year each. */
export const REFERRALS_PER_YEAR = 2;

/** Price of one extra listing slot, bought outright and never expiring. */
export const EXTRA_LISTING_PRICE = 10;

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

export const tierRank = (t) => TIERS[t || "none"]?.rank ?? 0;
export const tierLimit = (t) => TIERS[t || "none"]?.limit ?? 0;
export const cap = (s) => (s ? s.charAt(0).toUpperCase() + s.slice(1) : "");
export const byTier = (a, b) => tierRank(b.trader_tier || b.subscription_tier) - tierRank(a.trader_tier || a.subscription_tier);