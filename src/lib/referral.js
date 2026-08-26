import { base44 } from "@/api/base44Client";
import { tierLimit } from "@/lib/gems";
import { isNative, shareApp } from "@/lib/despia";

export const BONUS_PER_REFERRAL = 5;
/** Referrals supplement a plan — they can never fully replace upgrading. */
export const MAX_REFERRAL_BONUS = 20;

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

/** Tier capacity plus whatever the trader has unlocked through referrals. */
export function effectiveLimit(trader) {
  const base = tierLimit(trader?.subscription_tier);
  if (base === Infinity) return Infinity;
  return base + (trader?.referral_bonus_listings || 0);
}

export const bonusRemaining = (trader) =>
  Math.max(0, MAX_REFERRAL_BONUS - (trader?.referral_bonus_listings || 0));

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
 * Links a brand-new (email-verified) trader to the owner of `code` and grants
 * the referrer their bonus slots. Fails silently — onboarding is never blocked.
 */
export async function redeemReferralCode(code, newTrader) {
  const clean = String(code || "").trim().toUpperCase();
  if (!clean || !newTrader?.id || newTrader.referred_by_code) return false;
  try {
    const rows = await base44.entities.Trader.filter({ referral_code: clean });
    const referrer = rows[0];
    if (!referrer || referrer.id === newTrader.id) return false;

    const granted = Math.min(BONUS_PER_REFERRAL, bonusRemaining(referrer));
    await base44.entities.Trader.update(newTrader.id, { referred_by_code: clean });
    await base44.entities.Referral.create({
      referrer_id: referrer.id,
      code: clean,
      referred_trader_id: newTrader.id,
      referred_email: newTrader.user_email || "",
      bonus_granted: granted,
    });
    await base44.entities.Trader.update(referrer.id, {
      referral_count: (referrer.referral_count || 0) + 1,
      referral_bonus_listings: (referrer.referral_bonus_listings || 0) + granted,
    });
    return true;
  } catch {
    return false;
  }
}