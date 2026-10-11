/**
 * Shared verification vocabulary. Verification runs on Shufti Pro's hosted
 * page; nothing in the browser can grant a badge (see shuftiCallback).
 *
 *   buyer    → optional KYC (ID + selfie)            → Verified Buyer
 *   trader   → KYC + AML screening                   → Verified Trader
 *   business → Platinum: KYB + KYC + AML screening   → Verified Business
 */

/** Matches the Verification entity's status enum. */
export const STATUS = {
  NONE: "none",
  PENDING: "pending",
  REVIEW: "review",
  RESUBMISSION: "resubmission_requested",
  DECLINED: "declined",
  APPROVED: "approved",
  EXPIRED: "expired",
  ABANDONED: "abandoned",
};

export const isAwaitingDecision = (status) => status === STATUS.PENDING || status === STATUS.REVIEW;

/** Display only — the enforced copies of these caps live in submitVerification. */
export const LIMITS = { perDay: 3, lifetime: 6, cooldownMinutes: 15 };

export const SUPPORT_EMAIL = "support@gems24.lk";

export const LEVEL_LABEL = {
  buyer: "Verified Buyer",
  trader: "Verified Trader",
  business: "Verified Business",
};

/** What each level checks, in plain words. */
export const LEVEL_CHECKS = {
  buyer: ["Photo ID", "Selfie liveness check"],
  trader: ["Photo ID", "Selfie liveness check", "Anti-money-laundering screening"],
  business: ["Company registry check", "Photo ID of the account holder", "Selfie liveness check", "Anti-money-laundering screening (company and holder)"],
};

const RANK = { buyer: 1, trader: 2, business: 3 };

/** The badge level this account would earn now. Platinum traders are businesses. */
export const requiredLevel = (t) =>
  t?.account_type === "buyer" ? "buyer" : t?.subscription_tier === "platinum" ? "business" : "trader";

/**
 * The public badge is only valid when it was granted for the trader's current
 * account type. Rows verified before `verified_as` existed are treated as
 * valid for whatever account they sit on.
 */
export const isVerified = (t) =>
  !!t?.verified && (!t.verified_as || t.verified_as === t.account_type);

/** The level the current badge covers ("" if none). Legacy badges predate levels. */
export const heldLevel = (t) =>
  !isVerified(t) ? "" : t.verified_level || (t.account_type === "buyer" ? "buyer" : "trader");

export const coversRequired = (t) => {
  const held = heldLevel(t);
  return !!held && RANK[held] >= RANK[requiredLevel(t)];
};

export const badgeLabel = (level) => LEVEL_LABEL[level] || "Verified";

/** Shown wherever a seller-supplied certificate appears. */
export const CERTIFICATE_NOTICE = "Certificate provided by seller — unverified by Gems24";
