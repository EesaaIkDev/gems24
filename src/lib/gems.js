export const LOGO_URL = "https://media.base44.com/images/public/user_6a15c93e5397a059c19fe346/a298fa6bd_Gems24-logo.png";

export const TIERS = {
  none: { key: "none", label: "Free", limit: 0, rank: 0, price: null },
  bronze: { key: "bronze", label: "Bronze", limit: 3, rank: 1, price: 9 },
  silver: { key: "silver", label: "Silver", limit: 10, rank: 2, price: 29 },
  gold: { key: "gold", label: "Gold", limit: 30, rank: 3, price: 79 },
  platinum: { key: "platinum", label: "Platinum", limit: Infinity, rank: 4, price: 199 },
};

export const TIER_ORDER = ["bronze", "silver", "gold", "platinum"];

export const TIER_STYLES = {
  bronze: "bg-[#CD7F32]/15 text-[#8a4f16] dark:text-[#e0a56d] border-[#CD7F32]/40",
  silver: "bg-[#C0C0C0]/20 text-slate-600 dark:text-slate-300 border-[#C0C0C0]/50",
  gold: "bg-[#FFD700]/20 text-[#8a6d00] dark:text-[#f0d264] border-[#FFD700]/50",
  platinum: "bg-[#E5E4E2]/30 text-slate-700 dark:text-slate-200 border-[#E5E4E2]/60",
};

export const GEM_TYPES = ["sapphire", "ruby", "emerald", "spinel", "garnet", "other"];
export const TREATMENTS = ["heated", "unheated", "other"];

export const tierRank = (t) => TIERS[t || "none"]?.rank ?? 0;
export const tierLimit = (t) => TIERS[t || "none"]?.limit ?? 0;
export const cap = (s) => (s ? s.charAt(0).toUpperCase() + s.slice(1) : "");
export const byTier = (a, b) => tierRank(b.trader_tier || b.subscription_tier) - tierRank(a.trader_tier || a.subscription_tier);