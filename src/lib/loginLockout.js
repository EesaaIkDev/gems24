// Client-side login throttling. The platform owns the real auth backend, so
// this is a UX guard that stops repeated attempts from this device.
const KEY = "gems24_login_attempts";
export const MAX_ATTEMPTS = 5;
export const LOCK_MINUTES = 15;

const read = () => {
  const raw = localStorage.getItem(KEY);
  return raw ? JSON.parse(raw) : {};
};

const norm = (email) => (email || "").trim().toLowerCase();

/** Minutes remaining on a lockout, or 0 when the account can try again. */
export function lockedMinutes(email) {
  const rec = read()[norm(email)];
  if (!rec?.lockedUntil) return 0;
  const ms = rec.lockedUntil - Date.now();
  return ms > 0 ? Math.ceil(ms / 60000) : 0;
}

/** Records a failed attempt; returns attempts remaining before lockout. */
export function recordFailure(email) {
  const all = read();
  const key = norm(email);
  const count = (all[key]?.count || 0) + 1;
  all[key] = count >= MAX_ATTEMPTS
    ? { count: 0, lockedUntil: Date.now() + LOCK_MINUTES * 60000 }
    : { count };
  localStorage.setItem(KEY, JSON.stringify(all));
  return MAX_ATTEMPTS - count;
}

export function clearFailures(email) {
  const all = read();
  delete all[norm(email)];
  localStorage.setItem(KEY, JSON.stringify(all));
}