// Shufti Pro verification: start, callback, admin review.
import { assert, assertEquals } from 'jsr:@std/assert@1';
import { SECRETS, db, reset, shuftiSign, state } from './mock.ts';
import submitVerification from '../../base44/functions/submitVerification/entry.ts';
import shuftiCallback from '../../base44/functions/shuftiCallback/entry.ts';
import reviewVerification from '../../base44/functions/reviewVerification/entry.ts';
import { evaluate, validSignature } from '../../base44/shared/shufti.ts';

const call = async (fn: (r: Request) => Promise<Response>, body: unknown) => {
  const res = await fn(new Request('http://x', { method: 'POST', body: JSON.stringify(body) }));
  return { status: res.status, body: await res.json() };
};
const callback = async (body: unknown, signature?: string) => {
  const raw = JSON.stringify(body);
  const res = await shuftiCallback(new Request('http://x', {
    method: 'POST', body: raw, headers: { signature: signature ?? (await shuftiSign(raw)) },
  }));
  return { status: res.status, body: await res.json() };
};

const ME = { id: 'u1', email: 'me@x.com', role: 'user' };
const ADMIN = { id: 'admin', email: 'admin@x.com', role: 'admin' };
const trader = () => db.Trader[0];
const verification = () => db.Verification[0];

function seed(overrides: Record<string, unknown> = {}) {
  reset();
  db.Trader = [{
    id: 'T', full_name: 'Me', business_name: 'Gem House', user_email: ME.email, created_by_id: ME.id,
    account_type: 'trader', subscription_tier: 'gold', ...overrides,
  }];
  state.user = ME;
  state.shufti.respond = (path, body) => path === '/'
    ? { reference: body.reference, event: 'request.pending', verification_url: 'https://app.shuftipro.com/verify/abc' }
    : { reference: body.reference, event: 'verification.accepted', verification_result: {} };
}

async function start() {
  const res = await call(submitVerification, {});
  return { ...res, request: state.shufti.requests.find((r) => r.path === '/')?.body };
}

// ---------------------------------------------------------------- signature

Deno.test('signature: accepts current and legacy Shufti schemes, rejects anything else', async () => {
  const raw = '{"reference":"r","event":"verification.accepted"}';
  assert(await validSignature(raw, await shuftiSign(raw), 'k'.repeat(4)) === false);
  assert(await validSignature(raw, await shuftiSign(raw, 'key'), 'key'));
  const legacy = Array.from(new Uint8Array(await crypto.subtle.digest('SHA-256', new TextEncoder().encode(raw + 'key'))))
    .map((b) => b.toString(16).padStart(2, '0')).join('');
  assert(await validSignature(raw, legacy, 'key'));
  assert(!(await validSignature(raw, null, 'key')));
  assert(!(await validSignature(raw + ' ', await shuftiSign(raw, 'key'), 'key')));
});

// ---------------------------------------------------------------- starting

Deno.test('start: trader gets KYC + AML, hosted link returned, no PII in the reference', async () => {
  seed();
  const { body, request } = await start();
  assertEquals(body.state, 'redirect');
  assertEquals(body.url, 'https://app.shuftipro.com/verify/abc');
  assertEquals(body.level, 'trader');
  assert(request.document && request.face && request.background_checks);
  assertEquals(request.kyb, undefined);
  assertEquals(request.background_checks.process_from_document, '1');
  assertEquals(request.background_checks.ongoing, '0', 'ongoing monitoring only when enabled');
  assert(/^g24_[0-9a-f-]{36}$/.test(request.reference));
  assert(!JSON.stringify(request).includes(ME.email));
  assert(state.shufti.requests[0].auth.startsWith('Basic '));
  assertEquals([verification().kyc_status, verification().aml_status, verification().kyb_status], ['pending', 'pending', 'none']);
  assertEquals(trader().verified, undefined, 'starting never grants anything');
});

Deno.test('start: Platinum is a business — KYB + business AML added', async () => {
  seed({ subscription_tier: 'platinum', trader_kind: 'business' });
  const { body, request } = await start();
  assertEquals(body.level, 'business');
  assert(request.kyb && request.aml_for_businesses && request.background_checks);
  assertEquals(request.aml_for_businesses.business_name, 'Gem House');
  assertEquals(verification().kyb_status, 'pending');
});

Deno.test('start: buyers get optional KYC only; ongoing AML follows the secret', async () => {
  seed({ account_type: 'buyer', subscription_tier: 'none' });
  const { body, request } = await start();
  assertEquals(body.level, 'buyer');
  assertEquals(request.background_checks, undefined);
  assertEquals(verification().aml_status, 'none');

  seed();
  SECRETS.SHUFTI_ONGOING_AML = '1';
  try {
    assertEquals((await start()).request.background_checks.ongoing, '1');
  } finally {
    delete SECRETS.SHUFTI_ONGOING_AML;
  }
});

Deno.test('start: an open link is reused instead of paying for a second request', async () => {
  seed();
  await start();
  const again = await call(submitVerification, {});
  assertEquals(again.body.url, 'https://app.shuftipro.com/verify/abc');
  assertEquals(state.shufti.requests.filter((r) => r.path === '/').length, 1);
  assertEquals(db.VerificationAttempt.length, 1);
});

Deno.test('start: Shufti errors or forged responses never charge an attempt', async () => {
  seed();
  state.shufti.respond = () => ({ event: 'request.invalid', error: { message: 'bad' } });
  assertEquals((await start()).status, 502);
  state.shufti.respond = () => ({ event: 'request.pending', verification_url: 'https://evil' });
  state.shufti.badSignature = true;
  assertEquals((await start()).status, 502);
  assertEquals(db.VerificationAttempt?.length ?? 0, 0);
});

Deno.test('start: traders need a plan; verified at the right level is a no-op; Gold badge can upgrade to business', async () => {
  seed({ subscription_tier: 'none' });
  assertEquals((await start()).status, 403);
  seed({ verified: true, verified_as: 'trader', verified_level: 'trader' });
  assertEquals((await start()).body.state, 'already_verified');
  seed({ verified: true, verified_as: 'trader', verified_level: 'trader', subscription_tier: 'platinum', trader_kind: 'business' });
  assertEquals((await start()).body.level, 'business');
});

Deno.test('start: missing keys fail closed', async () => {
  seed();
  const saved = SECRETS.SHUFTI_SECRET_KEY;
  SECRETS.SHUFTI_SECRET_KEY = '';
  try {
    assertEquals((await start()).status, 503);
  } finally {
    SECRETS.SHUFTI_SECRET_KEY = saved;
  }
});

// ---------------------------------------------------------------- callbacks

const ref = () => verification().provider_ref;
const statusSays = (result: Record<string, unknown>) => {
  state.shufti.respond = (_p, body) => ({ reference: body.reference, ...result });
};

Deno.test('callback: bad signature rejected and nothing changes', async () => {
  seed();
  await start();
  const res = await callback({ reference: ref(), event: 'verification.accepted' }, 'nope');
  assertEquals(res.status, 401);
  assertEquals(trader().verified, undefined);
});

Deno.test('callback: a forged "accepted" body cannot beat Shufti\'s real status', async () => {
  seed();
  await start();
  statusSays({ event: 'verification.declined', declined_reason: 'Face did not match', verification_result: { face: 0 } });
  await callback({ reference: ref(), event: 'verification.accepted' });
  assertEquals(trader().verified, undefined);
  assertEquals(verification().status, 'declined');
  assertEquals(verification().decline_reason, 'Face did not match');
  assertEquals(verification().kyc_status, 'failed');
  assertEquals(db.VerificationAttempt[0].outcome, 'declined');
});

Deno.test('callback: accepted grants the badge for the requested level', async () => {
  seed({ subscription_tier: 'platinum', trader_kind: 'business' });
  await start();
  statusSays({ event: 'verification.accepted', verification_result: { document: { name: 1, dob: 1 }, face: 1, background_checks: 1, kyb: 1, aml_for_businesses: 1 } });
  await callback({ reference: ref(), event: 'verification.accepted' });
  assertEquals([trader().verified, trader().verified_level, trader().verified_as], [true, 'business', 'trader']);
  assertEquals([verification().kyc_status, verification().aml_status, verification().kyb_status], ['passed', 'passed', 'passed']);
  assertEquals(verification().verification_url, '');
});

Deno.test('callback: first-screening AML match goes to admin review, not a badge or a decline', async () => {
  seed();
  await start();
  statusSays({ event: 'verification.declined', verification_result: { document: 1, face: 1, background_checks: 0 } });
  await callback({ reference: ref(), event: 'verification.declined' });
  assertEquals(trader().verified, undefined);
  assertEquals([verification().status, verification().aml_status, verification().kyc_status], ['review', 'review', 'passed']);
  assertEquals((await call(submitVerification, {})).body.state, 'under_review');
});

Deno.test('callback: ongoing AML match after approval flags for review and keeps the badge', async () => {
  seed();
  await start();
  statusSays({ event: 'verification.accepted', verification_result: { document: 1, face: 1, background_checks: 1 } });
  await callback({ reference: ref(), event: 'verification.accepted' });
  assertEquals(trader().verified, true);

  statusSays({ event: 'verification.declined', verification_result: { background_checks: 0 } });
  await callback({ reference: ref(), event: 'verification.status.changed' });
  assertEquals(trader().verified, true, 'never auto-revoked');
  assertEquals(trader().aml_flagged, true);
  assertEquals(verification().aml_status, 'flagged');
});

Deno.test('callback: cancelled/timeout abandons; pending events change nothing; unknown refs ignored', async () => {
  seed();
  await start();
  statusSays({ event: 'review.pending' });
  await callback({ reference: ref(), event: 'review.pending' });
  assertEquals(verification().status, 'pending');
  statusSays({ event: 'request.timeout' });
  await callback({ reference: ref(), event: 'request.timeout' });
  assertEquals(verification().status, 'abandoned');
  assertEquals(db.VerificationAttempt[0].outcome, 'abandoned');
  assertEquals((await callback({ reference: 'g24_unknown', event: 'verification.accepted' })).body.unmatched, true);
});

Deno.test('callback: a late result for a superseded attempt cannot grant a badge', async () => {
  seed();
  await start();
  const old = ref();
  Object.assign(verification(), { provider_ref: 'g24_newer', status: 'pending' });
  statusSays({ event: 'verification.accepted', verification_result: {} });
  const res = await callback({ reference: old, event: 'verification.accepted' });
  assertEquals(res.body.stale, true);
  assertEquals(trader().verified, undefined);
});

Deno.test('evaluate: unknown services take the overall decision; objects fail on any 0', () => {
  assertEquals(evaluate({ event: 'verification.accepted', verification_result: {} }, 'trader').aml, 'pass');
  assertEquals(evaluate({ event: 'verification.declined', verification_result: { document: { name: 1, dob: 0 } } }, 'buyer').kyc, 'fail');
  assertEquals(evaluate({ event: 'verification.declined', verification_result: {} }, 'trader').kyc, 'fail');
  assertEquals(evaluate({ event: 'request.pending' }, 'business').decision, 'pending');
});

// ---------------------------------------------------------------- admin review

async function toReview() {
  seed();
  await start();
  statusSays({ event: 'verification.declined', verification_result: { document: 1, face: 1, background_checks: 0 } });
  await callback({ reference: ref(), event: 'verification.declined' });
}

Deno.test('review: admin only', async () => {
  await toReview();
  assertEquals((await call(reviewVerification, { action: 'list' })).status, 403);
});

Deno.test('review: approve a false-positive AML match grants the badge; decline keeps it off', async () => {
  await toReview();
  state.user = ADMIN;
  const list = await call(reviewVerification, { action: 'list' });
  assertEquals(list.body.rows.map((r: any) => [r.trader_id, r.kind]), [['T', 'first_screening']]);
  await call(reviewVerification, { action: 'approve', trader_id: 'T', note: 'name-alike' });
  assertEquals([trader().verified, trader().verified_level], [true, 'trader']);
  assertEquals([verification().status, verification().aml_status, verification().reviewed_by], ['approved', 'passed', ADMIN.email]);

  await toReview();
  state.user = ADMIN;
  await call(reviewVerification, { action: 'decline', trader_id: 'T' });
  assertEquals(trader().verified, undefined);
  assertEquals([verification().status, verification().aml_status], ['declined', 'failed']);
});

Deno.test('review: post-approval flag can be cleared or the badge revoked', async () => {
  seed({ verified: true, verified_as: 'trader', verified_level: 'trader', aml_flagged: true });
  db.Verification = [{ id: 'V', trader_id: 'T', status: 'approved', aml_status: 'flagged', kyc_status: 'passed', kyb_status: 'none' }];
  state.user = ADMIN;
  await call(reviewVerification, { action: 'clear_flag', trader_id: 'T' });
  assertEquals([trader().verified, trader().aml_flagged, verification().aml_status], [true, false, 'passed']);

  trader().aml_flagged = true;
  await call(reviewVerification, { action: 'revoke', trader_id: 'T' });
  assertEquals([trader().verified, trader().verified_level, trader().aml_flagged], [false, '', false]);
  assertEquals(verification().status, 'declined');
});

Deno.test('review: reset_all clears every badge and limit, but only with confirmation', async () => {
  seed({ verified: true, verified_as: 'trader', verified_level: 'trader' });
  db.Verification = [{ id: 'V', trader_id: 'T', status: 'approved', attempt_count: 5, blocked: true }];
  state.user = ADMIN;
  assertEquals((await call(reviewVerification, { action: 'reset_all' })).status, 400);
  const res = await call(reviewVerification, { action: 'reset_all', confirm: 'RESET' });
  assertEquals(res.body, { ok: true, traders: 1, states: 1 });
  assertEquals([trader().verified, verification().status, verification().attempt_count, verification().blocked], [false, 'none', 0, false]);
});
