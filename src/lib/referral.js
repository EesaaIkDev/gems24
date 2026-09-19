import { base44 } from "@/api/base44Client";
import { REFERRALS_PER_YEAR, REFERRAL_BONUS, tierLimit, tierRank } from "@/lib/gems";
import { isNative, shareApp } from "@/lib/despia";

const YEAR_MS = 365 * 24 * 60 * 60 * 1000;

/** Bonus listings a trader earns per referral, scaled to their own grade. */
export const bonusPerReferral = (trader) => REFERRAL_BONUS[trader?.subscription_tier] || 0;

/** Referrals reset every 12 months; earned listings never do. */
export function referralsUsedThisYear(trader) {
  const start = trader?.referral_year_start ? new Date(trader.referral_year_start).getTime() : 0;
  if (!start || Date.now() - start >= YEAR_MS) return 0;
  return trader?.referral_count_year || 0;
}

export const referralsRemaining = (trader) =>
  Math.max(0, REFERRALS_PER_YEAR - referralsUsedThisYear(trader));

const PENDING_KEY = "gems24_referral_code";
// No 0/O/1/I — codes get read off screenshots and typed by hand.
const ALPHABET = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";

export const generateReferralCode = () =>
  Array.from({ length: 6 }, () => ALPHABET[Math.floor(Math.random() * ALPHABET.length)]).join("");

/** Fields every newly created trader gets, so a code exists from signup. */
export const newTraderReferralFields = () => ({
  referral_code: generateReferralCode(),
  referral_count: 0,
  referral_bonus_listings: 0,
});

export const referralLink = (code) => `${window.location.origin}/join?code=${code}`;

export const referralMessage = (code) =>
  `I've been trading gemstones on Gems24 — join with my code ${code} and we can connect: ${referralLink(code)}`;

/** Tier capacity plus referral bonuses and any slots bought outright. */
export function effectiveLimit(trader) {
  const base = tierLimit(trader?.subscription_tier);
  if (base === Infinity) return Infinity;
  return base + (trader?.referral_bonus_listings || 0) + (trader?.purchased_listings || 0);
}

/** Bonus listings still reachable in the trader's current referral year. */
export const bonusRemaining = (trader) => referralsRemaining(trader) * bonusPerReferral(trader);

/**
 * Resolves the owner of a code. Only established traders (on a plan) can hand
 * out working codes — presented to users simply as a valid / invalid code.
 */
export async function findReferrer(code) {
  const clean = String(code || "").trim().toUpperCase();
  if (!clean) return null;
  try {
    const rows = await base44.entities.Trader.filter({ referral_code: clean });
    const referrer = rows[0];
    if (!referrer || tierRank(referrer.subscription_tier) === 0) return null;
    return referrer;
  } catch {
    return null;
  }
}

export const validateReferralCode = async (code) => !!(await findReferrer(code));

/** Back-fills a code for traders created before the referral programme. */
export async function ensureReferralCode(trader) {
  if (!trader) return null;
  if (trader.referral_code) return trader.referral_code;
  const code = generateReferralCode();
  await base44.entities.Trader.update(trader.id, { referral_code: code });
  return code;
}

/** One tap: native share sheet, then Web Share, then clipboard. */
export async function shareInvite(code) {
  const message = referralMessage(code);
  if (isNative) {
    shareApp(message, referralLink(code));
    return "shared";
  }
  if (navigator.share) {
    try {
      await navigator.share({ title: "Gems24", text: message, url: referralLink(code) });
      return "shared";
    } catch {
      return "cancelled";
    }
  }
  await navigator.clipboard.writeText(message);
  return "copied";
}

export const setPendingReferralCode = (code) =>
  localStorage.setItem(PENDING_KEY, String(code).trim().toUpperCase());
export const getPendingReferralCode = () => localStorage.getItem(PENDING_KEY) || "";
export const clearPendingReferralCode = () => localStorage.removeItem(PENDING_KEY);

/**
 * Asks the server to credit the signup to the owner of `code`. The referrer's
 * counters and bonus slots are written there, never here — the annual cap has to
 * be enforced somewhere the browser can't skip it. Fails silently: onboarding is
 * never blocked.
 */
export async function redeemReferralCode(code) {
  const clean = String(code || "").trim().toUpperCase();
  if (!clean) return false;
  try {
    const { data } = await base44.functions.invoke("redeemReferral", { code: clean });
    return data?.state === "credited";
  } catch {
    return false;
  }
}