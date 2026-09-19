/**
 * Shared verification vocabulary.
 *
 * The buyer document type is not finalised. Everything buyer-facing reads from
 * BUYER_DOCUMENT below, so switching from a government ID to something else is
 * a one-line change here rather than a hunt through components.
 *
 * The verification provider is also undecided, so nothing here names one.
 */

/** Buyer document. Change `label` when the document type is settled. */
export const BUYER_DOCUMENT = {
  /** Used mid-sentence, e.g. "Photograph your government ID". */
  label: "government ID",
  /** Provider-specific document code, filled in once a provider is chosen. */
  providerType: null,
};

export const TRADER_DOCUMENT = {
  label: "Gem License",
  providerType: null,
};

export const documentFor = (trader) =>
  trader?.account_type === "buyer" ? BUYER_DOCUMENT : TRADER_DOCUMENT;

/** Matches the Verification entity's status enum and the webhook's status map. */
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

/** Statuses where a submission is queued and we are waiting on a decision. */
export const isAwaitingDecision = (status) =>
  status === STATUS.PENDING || status === STATUS.REVIEW;

/** Statuses where the trader can start or continue a check. */
export const canAttempt = (status) =>
  !status ||
  status === STATUS.NONE ||
  status === STATUS.DECLINED ||
  status === STATUS.EXPIRED ||
  status === STATUS.ABANDONED ||
  status === STATUS.RESUBMISSION;

/** Display only — the enforced copies of these caps live in submitVerification. */
export const LIMITS = {
  perDay: 3,
  lifetime: 6,
  cooldownMinutes: 15,
};

export const SUPPORT_EMAIL = "support@gems24.lk";
