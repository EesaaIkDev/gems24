import { createClientFromRequest } from 'npm:@base44/sdk@0.8.54';

/**
 * Lets the caller cancel their own in-progress (pending) verification.
 * The Shufti reference is detached, so a late result for the cancelled
 * journey is treated as stale by shuftiCallback and can't grant a badge.
 * The attempt still counts toward the limits (Shufti bills on request).
 */
export default async function (req: Request): Promise<Response> {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me().catch((e: any) => (e.status === 401 ? null : Promise.reject(e)));
    if (!user?.email) return Response.json({ error: 'Unauthorized' }, { status: 401 });

    const svc = base44.asServiceRole.entities;
    const trader = (await svc.Trader.filter({ user_email: user.email }))?.[0];
    if (!trader) return Response.json({ error: 'No profile found' }, { status: 404 });

    const state = (await svc.Verification.filter({ trader_id: trader.id }))?.[0];
    if (!state || state.status !== 'pending') {
      return Response.json({ error: 'There is no verification in progress to cancel.' }, { status: 409 });
    }

    const now = new Date().toISOString();
    const reference = state.provider_ref;
    await svc.Verification.update(state.id, {
      status: 'abandoned',
      provider_ref: '',
      verification_url: '',
      verification_url_expires_at: null,
      kyc_status: 'none',
      aml_status: 'none',
      kyb_status: 'none',
      last_decision_at: now,
    });
    if (reference) {
      const attempt = (await svc.VerificationAttempt.filter({ provider_ref: reference }))?.[0];
      if (attempt) {
        await svc.VerificationAttempt.update(attempt.id, {
          outcome: 'abandoned',
          reason: 'cancelled_by_user',
          decided_at: now,
        });
      }
    }

    console.log(`verification cancelled trader=${trader.id}`);
    return Response.json({ ok: true });
  } catch (error: any) {
    console.error('cancelVerification failed', error);
    return Response.json({ error: 'Could not cancel verification.' }, { status: 500 });
  }
}