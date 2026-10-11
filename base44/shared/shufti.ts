import { secrets } from 'base44:runtime';

/**
 * Shufti Pro client and result rules shared by submitVerification,
 * shuftiCallback and reviewVerification.
 *
 * Secrets (Base44 → Settings → Secrets):
 *   SHUFTI_CLIENT_ID, SHUFTI_SECRET_KEY  — API credentials
 *   SHUFTI_ONGOING_AML=1                 — optional; enrol in ongoing AML
 *                                          monitoring (production accounts only)
 *   SHUFTI_CALLBACK_URL / SHUFTI_REDIRECT_URL — optional overrides
 */

export const API = 'https://api.shuftipro.com';
const APP_ID = '6a661583e07cf311ecceee39';
export const DEFAULT_CALLBACK = `https://base44.app/api/apps/${APP_ID}/functions/shuftiCallback`;
export const DEFAULT_REDIRECT = 'https://gems24.lk/profile?verification=done';
/** Minutes a hosted verification link stays valid (Shufti onsite default is 60). */
export const LINK_TTL_MIN = 60;

export const secret = (key: string): string => {
  let value: string | undefined;
  try {
    value = secrets?.get?.(key) ?? undefined;
  } catch {
    value = undefined;
  }
  return value || (globalThis as any).Deno?.env?.get(key) || '';
};

/** Badge levels, lowest to highest. A buyer badge never counts for a trader account. */
export const LEVELS = ['buyer', 'trader', 'business'] as const;
export type Level = (typeof LEVELS)[number];
export const levelRank = (l: string) => LEVELS.indexOf(l as Level) + 1;

/** What a trader must pass for their account: buyers optional KYC, Platinum = business. */
export function requiredLevel(trader: any): Level {
  if (trader?.account_type === 'buyer') return 'buyer';
  return trader?.subscription_tier === 'platinum' ? 'business' : 'trader';
}

/** Which checks each level runs. */
export const CHECKS: Record<Level, { kyc: boolean; aml: boolean; kyb: boolean }> = {
  buyer: { kyc: true, aml: false, kyb: false },
  trader: { kyc: true, aml: true, kyb: false },
  business: { kyc: true, aml: true, kyb: true },
};

/** The level a current badge is good for (legacy badges predate levels). */
export function heldLevel(trader: any): Level | '' {
  if (!trader?.verified) return '';
  if (trader.verified_as && trader.verified_as !== trader.account_type) return '';
  if (trader.verified_level) return trader.verified_level;
  return trader.account_type === 'buyer' ? 'buyer' : 'trader';
}

const hex = (buf: ArrayBuffer) =>
  Array.from(new Uint8Array(buf)).map((b) => b.toString(16).padStart(2, '0')).join('');
const sha256 = async (s: string) => hex(await crypto.subtle.digest('SHA-256', new TextEncoder().encode(s)));

function safeEqual(a: string, b: string): boolean {
  if (a.length !== b.length) return false;
  let diff = 0;
  for (let i = 0; i < a.length; i++) diff |= a.charCodeAt(i) ^ b.charCodeAt(i);
  return diff === 0;
}

/**
 * Shufti signs every response and callback: sha256(raw body + sha256(secret))
 * for accounts created after 15 March 2023, sha256(raw body + secret) before.
 * Both depend on the secret, so either is accepted.
 */
export async function validSignature(raw: string, signature: string | null, key = secret('SHUFTI_SECRET_KEY')) {
  if (!signature || !key) return false;
  const given = signature.trim().toLowerCase();
  const current = await sha256(raw + (await sha256(key)));
  const legacy = await sha256(raw + key);
  return safeEqual(given, current) || safeEqual(given, legacy);
}

const auth = () => 'Basic ' + btoa(`${secret('SHUFTI_CLIENT_ID')}:${secret('SHUFTI_SECRET_KEY')}`);

async function call(path: string, body: unknown) {
  const res = await fetch(`${API}${path}`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', Accept: 'application/json', Authorization: auth() },
    body: JSON.stringify(body),
  });
  const raw = await res.text();
  if (!(await validSignature(raw, res.headers.get('signature')))) {
    throw new Error(`Shufti ${path} response failed signature check (HTTP ${res.status})`);
  }
  return JSON.parse(raw);
}

/** The hosted (onsite) journey for a level: ID document + selfie, plus AML and KYB as required. */
export function verificationRequest(reference: string, level: Level, trader: any) {
  const checks = CHECKS[level];
  const ongoing = secret('SHUFTI_ONGOING_AML') === '1' ? '1' : '0';
  const request: Record<string, unknown> = {
    reference,
    callback_url: secret('SHUFTI_CALLBACK_URL') || DEFAULT_CALLBACK,
    redirect_url: secret('SHUFTI_REDIRECT_URL') || DEFAULT_REDIRECT,
    language: 'EN',
    verification_mode: 'any',
    allow_retry: '1',
    ttl: LINK_TTL_MIN,
    document: {
      proof: '',
      supported_types: ['id_card', 'passport', 'driving_license'],
      name: '',
      dob: '',
      document_number: '',
      expiry_date: '',
      issue_date: '',
    },
    face: { proof: '' },
  };
  if (checks.aml) {
    // Name and date of birth are read from the ID document the user just scanned.
    request.background_checks = { process_from_document: '1', ongoing, match_score: '100' };
  }
  if (checks.kyb) {
    // Empty keys make Shufti collect the company details on its hosted page.
    request.kyb = { advanced_search: '1', company_registration_number: '', company_name: '' };
    request.aml_for_businesses = { business_name: trader?.business_name || '', ongoing };
  }
  return request;
}

export const startVerification = (request: Record<string, unknown>) => call('/', request);
export const fetchStatus = (reference: string) => call('/status', { reference });

/** Grants the badge for a level. The only write that ever sets `verified: true`. */
export async function grantBadge(base44: any, trader: any, level: Level) {
  await base44.asServiceRole.entities.Trader.update(trader.id, {
    verified: true,
    verified_as: trader.account_type,
    verified_level: level,
    aml_flagged: false,
  });
}

/** A Shufti per-service result → pass / fail / unknown. Objects pass only if no field failed. */
function outcome(value: unknown): 'pass' | 'fail' | '' {
  if (value === 1 || value === '1') return 'pass';
  if (value === 0 || value === '0') return 'fail';
  if (value && typeof value === 'object') {
    const parts = Object.values(value as Record<string, unknown>).map(outcome).filter(Boolean);
    if (parts.includes('fail')) return 'fail';
    return parts.length ? 'pass' : '';
  }
  return '';
}

const combine = (...parts: Array<'pass' | 'fail' | ''>) =>
  parts.includes('fail') ? 'fail' : parts.includes('pass') ? 'pass' : '';

export type Decision = 'pending' | 'accepted' | 'declined' | 'abandoned' | 'ignored';

const EVENT: Record<string, Decision> = {
  'request.pending': 'pending',
  'request.received': 'pending',
  'review.pending': 'pending',
  'verification.accepted': 'accepted',
  'verification.declined': 'declined',
  'verification.cancelled': 'abandoned',
  'request.timeout': 'abandoned',
  'request.deleted': 'abandoned',
};

/**
 * Reads a Shufti status payload into per-check results for the level that was
 * requested. Unknown results take the overall decision, so an accepted request
 * passes every check it asked for.
 */
export function evaluate(payload: any, level: Level) {
  const decision: Decision = EVENT[String(payload?.event || '')] || 'ignored';
  const r = payload?.verification_result || {};
  const checks = CHECKS[level];
  const fill = (v: 'pass' | 'fail' | '') => v || (decision === 'accepted' ? 'pass' : '');
  const result = {
    decision,
    kyc: checks.kyc ? fill(combine(outcome(r.document), outcome(r.face))) : '',
    aml: checks.aml ? fill(combine(outcome(r.background_checks), checks.kyb ? outcome(r.aml_for_businesses) : '')) : '',
    kyb: checks.kyb ? fill(outcome(r.kyb)) : '',
    reason: String(payload?.declined_reason || ''),
  };
  // A decline that names no failing service is an identity failure.
  if (decision === 'declined' && ![result.kyc, result.aml, result.kyb].includes('fail')) result.kyc = 'fail';
  return result;
}
