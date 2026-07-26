import despia from "despia-native";

const ua = typeof navigator !== "undefined" ? navigator.userAgent.toLowerCase() : "";

export const isNative = ua.includes("despia");
export const isNativeIOS = isNative && (ua.includes("iphone") || ua.includes("ipad"));
export const isNativeAndroid = isNative && ua.includes("android");

const LOCK_KEY = "gems24_app_lock";

/** Fire-and-forget native command. No-op outside the Despia runtime. */
export function native(command) {
  if (!isNative) return;
  despia(command);
}

export function haptic(type = "light") {
  native(`${type}haptic://`);
}

/** Map this device's push registration to the signed-in user. */
export function registerPush(userId) {
  if (!isNative || !userId) return;
  despia(`setonesignalplayerid://?user_id=${userId}`);
}

export async function getAppVersion() {
  if (!isNative) return null;
  return despia("getappversion://", ["versionNumber", "bundleNumber"]);
}

export function saveImageToPhotos(url) {
  native(`savethisimage://?url=${encodeURIComponent(url)}`);
}

export function shareApp(message, url) {
  native(`shareapp://message?=${encodeURIComponent(message)}&url=${encodeURIComponent(url)}`);
}

/** Biometric app lock, backed by the encrypted identity vault. */
export function isAppLockEnabled() {
  return localStorage.getItem("gems24-app-lock") === "true";
}

export async function enableAppLock() {
  await despia(`setvault://?key=${LOCK_KEY}&value=enabled&locked=true`);
  localStorage.setItem("gems24-app-lock", "true");
}

export async function disableAppLock() {
  await despia(`setvault://?key=${LOCK_KEY}&value=enabled&locked=false`);
  localStorage.setItem("gems24-app-lock", "false");
}

/** Prompts Face ID / Touch ID. Resolves true when the vault returns the value. */
export async function verifyBiometrics() {
  const data = await despia(`readvault://?key=${LOCK_KEY}`, [LOCK_KEY]);
  return data?.[LOCK_KEY] === "enabled";
}