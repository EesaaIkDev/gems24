import OneSignal from "react-onesignal";
import { isNative } from "@/lib/despia";

export const ONESIGNAL_APP_ID = "78ef65ef-97d3-42ee-b333-03ae743891ca";

const inEditorPreview = () => {
  try {
    return window.self !== window.top;
  } catch {
    return true;
  }
};

/** A real, server-assigned subscription id — never the SDK's local- placeholder. */
export const isRegistered = (id) => Boolean(id) && !String(id).startsWith("local-");

/** The Despia shell already runs the native OneSignal SDK, so the web SDK only
    belongs in real browsers — and never inside the Base44 editor iframe. */
export const canUseWebPush = () =>
  typeof window !== "undefined" && !isNative && !inEditorPreview() && "serviceWorker" in navigator;

let initPromise = null;

export function initOneSignal() {
  if (!canUseWebPush()) return Promise.resolve(false);
  if (!initPromise) {
    initPromise = OneSignal.init({
      appId: ONESIGNAL_APP_ID,
      serviceWorkerPath: "onesignal/OneSignalSDKWorker.js",
      serviceWorkerParam: { scope: "/onesignal/" },
      allowLocalhostAsSecureOrigin: true,
    })
      .then(() => true)
      .catch(() => false);
  }
  return initPromise;
}

export const pushSubscriptionId = () => OneSignal.User.PushSubscription.id;
export const pushOptedIn = () => OneSignal.User.PushSubscription.optedIn === true;
export const requestPushPermission = () => OneSignal.Notifications.requestPermission();

export function onPushSubscriptionChange(handler) {
  OneSignal.User.PushSubscription.addEventListener("change", handler);
  return () => OneSignal.User.PushSubscription.removeEventListener("change", handler);
}

/** Ties this browser's push subscription to the signed-in trader. */
export async function identifyOneSignalUser(traderId) {
  if (!traderId || !canUseWebPush()) return;
  if (!(await initOneSignal())) return;
  await OneSignal.login(String(traderId)).catch(() => {});
}