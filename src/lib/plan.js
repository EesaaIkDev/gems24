/** Plan-year dates as the store reports them (see storeWebhook). */

const fmt = (iso) =>
  new Date(iso).toLocaleDateString(undefined, { day: "numeric", month: "long", year: "numeric" });

/** When the current plan year ends — and a scheduled downgrade lands. */
export function renewalLabel(trader) {
  const iso = trader?.pending_tier_at || trader?.plan_renews_at;
  return iso ? fmt(iso) : "your next renewal date";
}
