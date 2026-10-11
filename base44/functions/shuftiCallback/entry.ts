import { createClientFromRequest } from 'npm:@base44/sdk@0.8.52';
import { evaluate, fetchStatus, grantBadge, heldLevel, levelRank, validSignature } from '../../shared/shufti.ts';

/**
 * Shufti Pro callback. Register this function's URL as the callback in the
 * Shufti back office.
 *
 *  1. The Signature header must match the raw body (SHUFTI_SECRET_KEY).
 *  2. The body is only a nudge: the result is re-read from Shufti's status
 *     endpoint, so a replayed or edited callback can't grant anything.
 *  3. Before approval, results decide the badge. An AML match on the first
 *     screening goes to admin review instead of an outright decline.
 *  4. After approval nothing is revoked automatically. A later AML match
 *     (ongoing monitoring) or any other negative change flags the account for
 *     an admin, and the badge stays until they decide.
 *
 * Delivery is at-least-once; handling is idempotent.
 */

const STATUS = { pass: 'passed', fail: 'failed' } as const;

export default async function (req: Request): Promise<Response> {
  try {
    const raw = await req.text();
    if (!(await validSignature(raw, req.headers.get('signature')))) {
      console.warn('shuftiCallback: rejected callback with bad or missing signature');
      return Response.json({ error: 'Invalid signature' }, { status: 401 });
    }
    let body: any;
    try {
      body = JSON.parse(raw);
    } catch {
      return Response.json({ error: 'Malformed payload' }, { status: 400 });
    }
    const reference = String(body?.reference || '');
    if (!reference) return Response.json({ ok: true, ignored: true });

    const base44 = createClientFromRequest(req);
    const svc = base44.asServiceRole.entities;
    const attempt = (await svc.VerificationAttempt.filter({ provider_ref: reference }))?.[0];
    if (!attempt) {
      console.warn(`shuftiCallback: no attempt for reference=${reference}`);
      return Response.json({ ok: true, unmatched: true });
    }
    const state = (await svc.Verification.filter({ trader_id: attempt.trader_id }))?.[0];
    const trader = (await svc.Trader.filter({ id: attempt.trader_id }))?.[0];
    if (!state || !trader) return Response.json({ ok: true, unmatched: true });

    // Source of truth: Shufti's own record of this request.
    const status = await fetchStatus(reference);
    const level = (attempt.document_type || state.level) as any;
    const result = evaluate(status, level);
    const now = new Date().toISOString();
    const negative = [result.kyc, result.aml, result.kyb].includes('fail');

    // Already approved for this attempt (or an older one whose badge is held):
    // flag, never revoke.
    const held = heldLevel(trader);
    const isCurrent = state.provider_ref === reference;
    const approvedHere = held && levelRank(held) >= levelRank(level) && (!isCurrent || state.status === 'approved');
    if (approvedHere || !isCurrent) {
      if (approvedHere && negative && !trader.aml_flagged) {
        const amlHit = result.aml === 'fail';
        await svc.Trader.update(trader.id, { aml_flagged: true });
        await svc.Verification.update(state.id, {
          ...(amlHit ? { aml_status: 'flagged' } : {}),
          review_reason: amlHit
            ? 'Ongoing AML monitoring reported a match after approval.'
            : `Shufti changed a ${result.kyc === 'fail' ? 'KYC' : 'KYB'} result after approval.`,
          last_decision_at: now,
        });
        console.warn(`shuftiCallback: flagged trader=${trader.id} for review (post-approval change)`);
      }
      return Response.json({ ok: true, ...(approvedHere ? {} : { stale: true }) });
    }

    const checks = (fallback: string) => ({
      ...(state.kyc_status !== 'none' ? { kyc_status: result.kyc ? STATUS[result.kyc] : fallback } : {}),
      ...(state.aml_status !== 'none' ? { aml_status: result.aml ? STATUS[result.aml] : fallback } : {}),
      ...(state.kyb_status !== 'none' ? { kyb_status: result.kyb ? STATUS[result.kyb] : fallback } : {}),
    });
    const close = (outcome: string, reason = '') =>
      svc.VerificationAttempt.update(attempt.id, { outcome, reason, decided_at: now });

    if (result.decision === 'pending' || result.decision === 'ignored') {
      return Response.json({ ok: true, pending: true });
    }

    if (result.decision === 'abandoned') {
      await svc.Verification.update(state.id, {
        status: 'abandoned',
        ...checks('none'),
        verification_url: '',
        last_decision_at: now,
      });
      await close('abandoned', String(status?.event || ''));
      return Response.json({ ok: true });
    }

    const identityFailed = result.kyc === 'fail' || result.kyb === 'fail';
    if (identityFailed) {
      const reason = result.reason || 'Your verification could not be completed.';
      await svc.Verification.update(state.id, {
        status: 'declined',
        ...checks('none'),
        decline_reason: reason,
        verification_url: '',
        last_decision_at: now,
      });
      await close('declined', reason);
      return Response.json({ ok: true });
    }

    if (result.aml === 'fail') {
      // Possible watch-list match on the first screening: hold for an admin
      // rather than decline, so a name-alike false positive isn't locked out.
      await svc.Verification.update(state.id, {
        status: 'review',
        ...checks('none'),
        aml_status: 'review',
        review_reason: 'AML screening returned a possible match.',
        verification_url: '',
        last_decision_at: now,
      });
      await close('review', 'aml_match');
      return Response.json({ ok: true });
    }

    await svc.Verification.update(state.id, {
      status: 'approved',
      ...checks('passed'),
      decline_reason: '',
      review_reason: '',
      verification_url: '',
      last_decision_at: now,
    });
    await grantBadge(base44, trader, level);
    await close('approved');
    console.log(`shuftiCallback: approved trader=${trader.id} level=${level}`);
    return Response.json({ ok: true });
  } catch (error: any) {
    // Non-200 makes Shufti retry, which is right for a transient fault.
    console.error('shuftiCallback failed', error);
    return Response.json({ error: 'Callback processing failed' }, { status: 500 });
  }
}
