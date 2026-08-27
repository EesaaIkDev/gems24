// Client-side login throttling. The platform owns the real auth backend, so
// this is a UX guard that stops repeated attempts from this device.
// The first WARN_AFTER failures are silent (just "wrong password"). From
// there, each failure counts down until MAX_ATTEMPTS, when a temporary
// lockout kicks in.
const KEY = "gems24_login_attempts";
export const WARN_AFTER = 10;
export const MAX_ATTEMPTS = 16;
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

/**
 * Records a failed attempt.
 * Returns { locked: boolean, attemptsLeft: number|null } — attemptsLeft is
 * null while under the silent WARN_AFTER threshold (no warning shown yet).
 */
export function recordFailure(email) {
  const all = read();
  const key = norm(email);
  const count = (all[key]?.count || 0) + 1;
  if (count >= MAX_ATTEMPTS) {
    all[key] = { count: 0, lockedUntil: Date.now() + LOCK_MINUTES * 60000 };
    localStorage.setItem(KEY, JSON.stringify(all));
    return { locked: true, attemptsLeft: 0 };
  }
  all[key] = { count };
  localStorage.setItem(KEY, JSON.stringify(all));
  return { locked: false, attemptsLeft: count >= WARN_AFTER ? MAX_ATTEMPTS - count : null };
}

export function clearFailures(email) {
  const all = read();
  delete all[norm(email)];
  localStorage.setItem(KEY, JSON.stringify(all));
}