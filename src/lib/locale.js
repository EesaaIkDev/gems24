/** Best-guess country name from the browser locale, for pre-filling profiles. */
export function detectCountry() {
  try {
    const locale = navigator.languages?.[0] || navigator.language || "";
    const region = new Intl.Locale(locale).region;
    if (!region) return "";
    return new Intl.DisplayNames(["en"], { type: "region" }).of(region) || "";
  } catch {
    return "";
  }
}