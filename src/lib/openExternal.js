/**
 * Opens an external page (e.g. Shufti's hosted verification).
 *
 * Inside the Despia app the WebView can't navigate away to another domain —
 * the runtime only intercepts `window.open(url, "_blank")` and shows the page
 * in its in-app browser (or Safari/Chrome for whitelisted domains). Assigning
 * `location` there is silently dropped.
 *
 * On the web, a popup blocker may refuse the new tab (it opens after an await,
 * not directly in the tap), so fall back to the same tab.
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
