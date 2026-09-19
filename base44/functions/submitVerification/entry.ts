import { createClientFromRequest } from 'npm:@base44/sdk@0.8.44';

/**
 * Accepts a verification submission from the calling trader and puts it in the
 * pending queue.
 *
 * All limits are enforced here rather than in the client: a browser can call
 * this endpoint directly, so the UI copy about remaining attempts is a
 * courtesy, not a control. Identity checks are expected to cost roughly $1.30
 * each once a paid provider is wired in, so the caps guard real spend.
 *
 * Provider is deliberately not chosen yet. Everything below is provider
 * agnostic; the single hand-off point is marked PROVIDER SEAM. Until a provider
 * is connected, submissions land as 'pending' for manual review.
 *
 * Documents are referenced by private-storage URI only. The client uploads via
 * UploadPrivateFile, which requires a signed URL to read — never UploadFile,
 * which is public.
 */

const PER_DAY = 3;
const LIFETIME = 6;
const COOLDOWN_MS = 15 * 60 * 1000;
const DAY_MS = 24 * 60 * 60 * 1000;

const minutesUntil = (target: number) => Math.max(1, Math.ceil((target - Date.now()) / 60000));

export default async function (req: Request): Promise<Response> {
  try {
    const base44 = createClientFromRequest(req);

    const user = await base44.auth.me();
    if (!user?.email) {
      return Response.json({ error: 'Unauthorized' }, { status: 401 });
    }

    let body: any = {};
    try {
      body = await req.json();
    } catch {
      return Response.json({ error: 'Invalid request' }, { status: 400 });
    }

    // Only private-storage URIs are accepted. A public https URL here would mean
    // the client used the wrong upload integration and the document is exposed.
    const documents: string[] = Array.isArray(body?.documents)
      ? body.documents.filter((d: unknown) => typeof d === 'string' && d.length > 0).slice(0, 5)
      : [];
    if (documents.length === 0) {
      return Response.json({ error: 'No documents supplied' }, { status: 400 });
    }
    if (documents.some((d) => /^https?:\/\//i.test(d))) {
      return Response.json(
        { error: 'Documents must be uploaded to private storage' },
        { status: 400 }
      );
    }

    // Resolve the caller's own trader row. The client does not choose which
    // trader it is verifying.
    const traders = await base44.asServiceRole.entities.Trader.filter({ user_email: user.email });
    const trader = traders?.[0];
    if (!trader) {
      return Response.json({ error: 'No trader profile found' }, { status: 404 });
    }

    if (trader.verified) {
      return Response.json({ state: 'already_verified' });
    }

    const existing = (
      await base44.asServiceRole.entities.Verification.filter({ trader_id: trader.id })
    )?.[0] ?? null;

    if (existing?.blocked) {
      return Response.json({
        state: 'blocked',
        reason: 'Maximum verification attempts reached. Please contact support.',
      });
    }

    // One submission in flight at a time — stops double-taps creating duplicate work.
    if (existing && (existing.status === 'pending' || existing.status === 'review')) {
      return Response.json({ state: 'already_pending', status: existing.status });
    }

    const attemptCount = existing?.attempt_count || 0;
    if (attemptCount >= LIFETIME) {
      if (existing) {
        await base44.asServiceRole.entities.Verification.update(existing.id, { blocked: true });
      }
      return Response.json({
        state: 'blocked',
        reason: 'Maximum verification attempts reached. Please contact support.',
      });
    }

    const lastAt = existing?.last_attempt_at ? new Date(existing.last_attempt_at).getTime() : 0;
    if (lastAt && Date.now() - lastAt < COOLDOWN_MS) {
      return Response.json({
        state: 'cooldown',
        retryInMinutes: minutesUntil(lastAt + COOLDOWN_MS),
      });
    }

    // Rolling 24h window, counted from the audit log rather than a stored
    // counter so it cannot drift.
    const history = await base44.asServiceRole.entities.VerificationAttempt.filter({
      trader_id: trader.id,
    });
    const inLastDay = (history || []).filter(
      (a: any) => Date.now() - new Date(a.requested_at || a.created_date || 0).getTime() < DAY_MS
    );
    if (inLastDay.length >= PER_DAY) {
      const oldest = Math.min(
        ...inLastDay.map((a: any) => new Date(a.requested_at || a.created_date).getTime())
      );
      return Response.json({
        state: 'rate_limited',
        retryInMinutes: minutesUntil(oldest + DAY_MS),
      });
    }

    const documentType = trader.account_type === 'buyer' ? 'government_id' : 'gem_license';
    const now = new Date().toISOString();

    // PROVIDER SEAM
    // When a provider is chosen, call it here with `documents` and capture its
    // reference. Keep the failure path as-is: if the provider call throws,
    // return before writing the attempt so the trader is not charged an attempt
    // for our outage.
    const provider = 'manual';
    const providerRef = '';

    // Audit row first: if the state write fails we still have a record of the attempt.
    const attempt = await base44.asServiceRole.entities.VerificationAttempt.create({
      trader_id: trader.id,
      user_email: trader.user_email || user.email,
      document_type: documentType,
      document_uris: documents,
      provider,
      provider_ref: providerRef,
      requested_at: now,
      outcome: 'submitted',
    });

    const state = {
      trader_id: trader.id,
      user_email: trader.user_email || user.email,
      status: 'pending',
      document_type: documentType,
      provider,
      provider_ref: providerRef || attempt.id,
      submitted_at: now,
      attempt_count: attemptCount + 1,
      last_attempt_at: now,
      first_attempt_at: existing?.first_attempt_at || now,
      decline_reason: '',
      decline_reason_code: null,
    };

    if (existing) {
      await base44.asServiceRole.entities.Verification.update(existing.id, state);
    } else {
      await base44.asServiceRole.entities.Verification.create(state);
    }

    console.log(
      `verification submitted trader=${trader.id} attempt=${attemptCount + 1}/${LIFETIME} docs=${documents.length}`
    );

    return Response.json({
      state: 'submitted',
      status: 'pending',
      attemptsRemaining: LIFETIME - (attemptCount + 1),
    });
  } catch (error: any) {
    console.error('submitVerification failed', error);
    return Response.json({ error: 'Could not submit verification.' }, { status: 500 });
  }
}
