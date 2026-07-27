import despia from "despia-native";
import { isNative } from "@/lib/despia";
import { TIER_ORDER, tierRank } from "@/lib/gems";

/**
 * RevenueCat via the Despia native bridge — App Store / Google Play billing.
 * Entitlement ids in RevenueCat must match the tier keys: bronze, silver, gold, platinum.
 * Each tier has an offering of the same name (with monthly / yearly / lifetime packages).
 */

/** Opens the native RevenueCat paywall for a tier. */
export function launchPaywall(tier, externalId) {
  if (!isNative) return false;
  despia(`revenuecat://launchPaywall?external_id=${encodeURIComponent(externalId)}&offering=${tier}`);
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