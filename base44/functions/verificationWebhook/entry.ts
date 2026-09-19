import { createClientFromRequest } from 'npm:@base44/sdk@0.8.44';

/**
 * Applies a verification decision. This is the only thing in the system allowed
 * to grant a verified badge.
 *
 * Provider agnostic on purpose — the provider has not been chosen yet. It takes
 * a small normalised payload and verifies an HMAC-SHA256 signature over the raw
 * body, which is the scheme Veriff, Onfido, Sumsub and Persona all use (they
 * differ only in header name and payload shape, handled by the two maps below).
 *
 * Expected body:
 *   { "reference": "<provider_ref or attempt id>", "status": "approved",
 *     "reason": "...", "reasonCode": 0, "eventId": "..." }
 *
 * Delivery is assumed at-least-once and unordered, so handling is idempotent:
 * a decision is applied once per eventId and repeats are acknowledged with 200.
 *
 * Secrets required (backend environment only):
 *   VERIFICATION_WEBHOOK_SECRET — HMAC key
 */

const SIGNATURE_HEADERS = [
  'x-hmac-signature', // Veriff
  'x-signature', // Sumsub / generic
  'x-sha2-signature', // Onfido
  'persona-signature', // Persona
];

/** Provider vocabulary → our status enum. Extend when a provider is chosen. */
const STATUS_MAP: Record<string, string> = {
  approved: 'approved',
  approve: 'approved',
  success: 'approved',
  completed: 'approved',
  green: 'approved',
  declined: 'declined',
  decline: 'declined',
  rejected: 'declined',
  failed: 'declined',
  red: 'declined',
  resubmission_requested: 'resubmission_requested',
  resubmission: 'resubmission_requested',
  retry: 'resubmission_requested',
  review: 'review',
  pending: 'review',
  expired: 'expired',
  abandoned: 'abandoned',
};

const env = (key: string): string | undefined =>
  (globalThis as any).Deno?.env?.get(key) ?? undefined;

async function hmacHex(secret: string, raw: string): Promise<string> {
  const encoder = new TextEncoder();
  const key = await crypto.subtle.importKey(
    'raw',
    encoder.encode(secret),
    { name: 'HMAC', hash: 'SHA-256' },
    false,
    ['sign']
  );
  const signature = await crypto.subtle.sign('HMAC', key, encoder.encode(raw));
  return Array.from(new Uint8Array(signature))
    .map((b) => b.toString(16).padStart(2, '0'))
    .join('');
}

/** Value-constant comparison so the signature is not leaked byte by byte. */
function safeEqual(a: string, b: string): boolean {
  if (a.length !== b.length) return false;
  let diff = 0;
  for (let i = 0; i < a.length; i++) diff |= a.charCodeAt(i) ^ b.charCodeAt(i);
  return diff === 0;
}

export default async function (req: Request): Promise<Response> {
  try {
    const secret = env('VERIFICATION_WEBHOOK_SECRET');
    if (!secret) {
      console.error('verificationWebhook: VERIFICATION_WEBHOOK_SECRET is not set');
      return Response.json({ error: 'Not configured' }, { status: 500 });
    }

    // Raw body, read once, before any parsing — the signature covers these bytes.
    const raw = await req.text();

    const provided = SIGNATURE_HEADERS.map((h) => req.headers.get(h))
      .find((v) => !!v)
      ?.trim()
      .toLowerCase();

    const expected = await hmacHex(secret, raw);
    if (!provided || !safeEqual(provided, expected)) {
      console.warn('verificationWebhook: rejected payload with bad or missing signature');
      return Response.json({ error: 'Invalid signature' }, { status: 401 });
    }

    let event: any;
    try {
      event = JSON.parse(raw);
    } catch {
      return Response.json({ error: 'Malformed payload' }, { status: 400 });
    }

    const reference = String(event?.reference || event?.verification?.id || '');
    const rawStatus = String(event?.status || event?.verification?.status || '').toLowerCase();
    const status = STATUS_MAP[rawStatus];
    const eventId = event?.eventId || event?.verification?.attemptId || null;
    const reason = event?.reason || event?.verification?.reason || '';
    const reasonCode = event?.reasonCode ?? event?.verification?.reasonCode ?? null;

    // Unrecognised or non-decision payloads are acknowledged so the provider
    // stops retrying, but nothing is applied.
    if (!reference || !status) {
      return Response.json({ ok: true, ignored: true });
    }

    const base44 = createClientFromRequest(req);

    let state =
      (await base44.asServiceRole.entities.Verification.filter({ provider_ref: reference }))?.[0] ??
      null;
    if (!state) {
      state =
        (await base44.asServiceRole.entities.Verification.filter({ trader_id: reference }))?.[0] ??
        null;
    }

    if (!state) {
      console.warn(`verificationWebhook: no verification state for reference=${reference}`);
      return Response.json({ ok: true, unmatched: true });
    }

    // Idempotency: the same event landing twice must not re-apply anything.
    if (eventId && state.last_event_id === eventId && state.status === status) {
      return Response.json({ ok: true, duplicate: true });
    }

    const now = new Date().toISOString();

    await base44.asServiceRole.entities.Verification.update(state.id, {
      status,
      last_event_id: eventId,
      last_decision_at: now,
      decline_reason: status === 'approved' ? '' : reason,
      decline_reason_code: status === 'approved' ? null : reasonCode,
    });

    // Only an approval touches the public badge.
    if (status === 'approved') {
      await base44.asServiceRole.entities.Trader.update(state.trader_id, { verified: true });
      console.log(`verificationWebhook: approved trader=${state.trader_id}`);
    } else {
      console.log(
        `verificationWebhook: ${status} trader=${state.trader_id} reasonCode=${reasonCode}`
      );
    }

    // Close out the audit row and drop the document references — we keep the
    // decision for audit, not the documents.
    const attempts = await base44.asServiceRole.entities.VerificationAttempt.filter({
      trader_id: state.trader_id,
    });
    const open = (attempts || [])
      .filter((a: any) => a.outcome === 'submitted')
      .sort(
        (a: any, b: any) =>
          new Date(b.requested_at || 0).getTime() - new Date(a.requested_at || 0).getTime()
      )[0];
    if (open) {
      await base44.asServiceRole.entities.VerificationAttempt.update(open.id, {
        outcome: status,
        reason,
        reason_code: reasonCode,
        decided_at: now,
        document_uris: [],
      });
    }

    return Response.json({ ok: true });
  } catch (error: any) {
    // A non-200 makes the provider retry, which is what we want for a transient fault.
    console.error('verificationWebhook failed', error);
    return Response.json({ error: 'Webhook processing failed' }, { status: 500 });
  }
}
