import { createClientFromRequest } from 'npm:@base44/sdk@0.8.52';
import {
  CHECKS,
  LINK_TTL_MIN,
  heldLevel,
  levelRank,
  requiredLevel,
  secret,
  startVerification,
  verificationRequest,
} from '../../shared/shufti.ts';

/**
 * Starts (or resumes) a Shufti Pro hosted verification for the calling user
 * and returns the link to send them to. Nothing here grants a badge — only
 * shuftiCallback does, after confirming the result with Shufti.
 *
 *   Buyers   → optional KYC (ID + selfie)              → Verified Buyer
 *   Traders  → KYC + AML screening                     → Verified Trader
 *   Platinum → KYB + KYC of the submitter + AML        → Verified Business
 *
 * Each Shufti request is billed, so the limits below are enforced here, not in
 * the client, and an unexpired link is reused instead of opening a new request.
 */

const PER_DAY = 3;
const LIFETIME = 6;
const COOLDOWN_MS = 15 * 60 * 1000;
const DAY_MS = 24 * 60 * 60 * 1000;

const minutesUntil = (target: number) => Math.max(1, Math.ceil((target - Date.now()) / 60000));

export default async function (req: Request): Promise<Response> {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me().catch(() => null);
    if (!user?.email) return Response.json({ error: 'Unauthorized' }, { status: 401 });

    const trader = (await base44.asServiceRole.entities.Trader.filter({ user_email: user.email }))?.[0];
    if (!trader) return Response.json({ error: 'No profile found' }, { status: 404 });

    if (trader.account_type !== 'buyer' && (!trader.subscription_tier || trader.subscription_tier === 'none')) {
      return Response.json({ error: 'A trader plan is required before you can get verified.' }, { status: 403 });
    }

    const level = requiredLevel(trader);
    const held = heldLevel(trader);
    if (held && levelRank(held) >= levelRank(level)) {
      return Response.json({ state: 'already_verified', level: held });
    }

    const existing = (await base44.asServiceRole.entities.Verification.filter({ trader_id: trader.id }))?.[0] ?? null;
    const blocked = { state: 'blocked', reason: 'Maximum verification attempts reached. Please contact support.' };
    if (existing?.blocked) return Response.json(blocked);
    if (existing?.status === 'review') return Response.json({ state: 'under_review' });

    // Resume the open Shufti journey rather than paying for a second one.
    const linkLive =
      existing?.provider === 'shufti' &&
      existing.status === 'pending' &&
      existing.level === level &&
      existing.verification_url &&
      Date.parse(existing.verification_url_expires_at || '') > Date.now() + 60_000;
    if (linkLive) return Response.json({ state: 'redirect', url: existing.verification_url, level });

    const attemptCount = existing?.attempt_count || 0;
    if (attemptCount >= LIFETIME) {
      if (existing) await base44.asServiceRole.entities.Verification.update(existing.id, { blocked: true });
      return Response.json(blocked);
    }
    const lastAt = existing?.last_attempt_at ? Date.parse(existing.last_attempt_at) : 0;
    if (lastAt && Date.now() - lastAt < COOLDOWN_MS) {
      return Response.json({ state: 'cooldown', retryInMinutes: minutesUntil(lastAt + COOLDOWN_MS) });
    }
    const history = await base44.asServiceRole.entities.VerificationAttempt.filter({ trader_id: trader.id });
    const inLastDay = (history || []).filter(
      (a: any) => Date.now() - Date.parse(a.requested_at || a.created_date || 0) < DAY_MS
    );
    if (inLastDay.length >= PER_DAY) {
      const oldest = Math.min(...inLastDay.map((a: any) => Date.parse(a.requested_at || a.created_date)));
      return Response.json({ state: 'rate_limited', retryInMinutes: minutesUntil(oldest + DAY_MS) });
    }

    if (!secret('SHUFTI_CLIENT_ID') || !secret('SHUFTI_SECRET_KEY')) {
      console.error('submitVerification: SHUFTI_CLIENT_ID / SHUFTI_SECRET_KEY are not set');
      return Response.json({ error: 'Verification is temporarily unavailable.' }, { status: 503 });
    }

    // Opaque reference: no personal data travels to Shufti in the id.
    const reference = `g24_${crypto.randomUUID()}`;
    let started: any;
    try {
      started = await startVerification(verificationRequest(reference, level, trader));
    } catch (error) {
      // Our or Shufti's fault — no attempt is charged.
      console.error('submitVerification: Shufti request failed', error);
      return Response.json({ error: 'Verification is temporarily unavailable.' }, { status: 502 });
    }
    if (started?.event !== 'request.pending' || !started?.verification_url) {
      console.error(`submitVerification: unexpected Shufti event=${started?.event}`, started?.error);
      return Response.json({ error: 'Verification could not be started. Please try again.' }, { status: 502 });
    }

    const now = new Date().toISOString();
    const checks = CHECKS[level];
    await base44.asServiceRole.entities.VerificationAttempt.create({
      trader_id: trader.id,
      user_email: trader.user_email || user.email,
      document_type: level,
      document_uris: [],
      provider: 'shufti',
      provider_ref: reference,
      requested_at: now,
      outcome: 'submitted',
    });
    const state = {
      trader_id: trader.id,
      user_email: trader.user_email || user.email,
      status: 'pending',
      level,
      kyc_status: 'pending',
      aml_status: checks.aml ? 'pending' : 'none',
      kyb_status: checks.kyb ? 'pending' : 'none',
      document_type: level,
      provider: 'shufti',
      provider_ref: reference,
      verification_url: started.verification_url,
      verification_url_expires_at: new Date(Date.now() + LINK_TTL_MIN * 60_000).toISOString(),
      submitted_at: now,
      attempt_count: attemptCount + 1,
      last_attempt_at: now,
      first_attempt_at: existing?.first_attempt_at || now,
      decline_reason: '',
      decline_reason_code: null,
      review_reason: '',
    };
    if (existing) await base44.asServiceRole.entities.Verification.update(existing.id, state);
    else await base44.asServiceRole.entities.Verification.create(state);

    console.log(`verification started trader=${trader.id} level=${level} attempt=${attemptCount + 1}/${LIFETIME}`);
    return Response.json({
      state: 'redirect',
      url: started.verification_url,
      level,
      attemptsRemaining: LIFETIME - (attemptCount + 1),
    });
  } catch (error: any) {
    console.error('submitVerification failed', error);
    return Response.json({ error: 'Could not start verification.' }, { status: 500 });
  }
}
