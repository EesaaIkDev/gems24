import despia from "despia-native";
import { isNative } from "@/lib/despia";
import { TIER_ORDER, tierRank } from "@/lib/gems";

/**
 * RevenueCat via the Despia native bridge — App Store / Google Play billing.
 * Entitlement ids in RevenueCat must match the tier keys: bronze, silver, gold, platinum.
 * Every plan lives in the single "default" offering.
 */
const OFFERING = "default";

/** Opens the native RevenueCat paywall (the "default" offering holds every plan). */
export function launchPaywall(externalId) {
  if (!isNative) return false;
  despia(`revenuecat://launchPaywall?external_id=${encodeURIComponent(externalId)}&offering=${OFFERING}`);
  return true;
}

/** One store product per tier — each button buys exactly its own product. */
export const PRODUCT_IDS = {
  bronze: "gems24_bronze_yearly",
  silver: "gems24_silver_yearly",
  gold: "gems24_gold_yearly",
  platinum: "gems24_platinum_yearly",
};

/** Starts the native purchase of one tier's product. */
export function purchaseTier(externalId, tier) {
  const product = PRODUCT_IDS[tier];
  if (!isNative || !product) return false;
  despia(`revenuecat://purchase?external_id=${encodeURIComponent(externalId)}&product=${product}`);
  return true;
}

/** Opens Apple's native offer code redemption sheet (iOS only). */
export function presentCodeRedemption() {
  if (!isNative) return false;
  despia("revenuecat://presentCodeRedemptionSheet");
  return true;
}

/** Opens the native Customer Center (manage plan, restore, refunds). */
export function openCustomerCenter(externalId) {
  if (!isNative) return false;
  despia(`revenuecat://center?external_id=${encodeURIComponent(externalId)}`);
  return true;
}

/** Active entitlement ids straight from the device's store records. */
export async function getActiveEntitlements() {
  if (!isNative) return [];
  const data = await despia("getpurchasehistory://", ["restoredData"]);
  return (data?.restoredData ?? []).filter((p) => p.isActive).map((p) => p.entitlementId);
}

/** Highest tier the device is entitled to, or "none". */
export async function getEntitledTier() {
  const active = await getActiveEntitlements();
  return TIER_ORDER.filter((t) => active.includes(t)).sort((a, b) => tierRank(b) - tierRank(a))[0] || "none";
}