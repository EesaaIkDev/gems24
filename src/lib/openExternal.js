import despia from "despia-native";

/**
 * Opens an external page (e.g. Shufti's hosted verification).
 *
 * Inside the Despia app the WebView can't navigate away to another domain —
 * the runtime only intercepts `window.open(url, "_blank")` and shows the page
 * in its in-app browser (or Safari for domains whitelisted in the Despia
 * editor). iOS drops a `window.open` that isn't part of a tap, so call this
 * directly from a click handler, never after an `await`.
 *
 * On the web, a popup blocker may refuse the new tab, so fall back to the
 * same tab.
 *
 * Returns how the page was opened: "native", "tab", "same-tab" or "invalid".
 */
export function openExternal(url, { native = false, win = typeof window !== "undefined" ? window : null } = {}) {
  let parsed;
  try {
    parsed = new URL(url);
  } catch {
    return "invalid";
  }
  if (parsed.protocol !== "https:" || !win) return "invalid";
  const opened = win.open(parsed.href, "_blank");
  if (native) return "native";
  if (opened) {
    try {
      opened.opener = null;
    } catch {
      /* cross-origin window — nothing to clear */
    }
    return "tab";
  }
  win.location.assign(parsed.href);
  return "same-tab";
}

/** Shufti's hosted pages only — a stored link is never opened unless it points there. */
export function isShuftiUrl(url) {
  try {
    const { protocol, hostname } = new URL(url);
    return protocol === "https:" && (hostname === "shuftipro.com" || hostname.endsWith(".shuftipro.com"));
  } catch {
    return false;
  }
}

/**
 * Backup route in the app: Despia's native secure browser sheet
 * (ASWebAuthenticationSession / Custom Tabs). It's a native bridge call, so
 * iOS popup rules don't apply.
 */
export function openInSecureBrowser(url, run = despia) {
  if (!isShuftiUrl(url)) return false;
  run(`oauth://?url=${encodeURIComponent(url)}`);
  return true;
}
