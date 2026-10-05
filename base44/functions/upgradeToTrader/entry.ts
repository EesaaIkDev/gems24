import { createClientFromRequest } from 'npm:@base44/sdk@0.8.44';

/**
 * Switches the caller's account from buyer to trader. One-way — there is no
 * trader → buyer path.
 *
 * The verified badge is reset on the switch: a buyer is verified with a
 * government ID, a trader with a Gem License, so a "Verified trader" badge
 * must never be backed by a buyer ID check. The caller resolves to their own
 * Trader row server-side — the client never supplies an id.
 *
 * Rate-limit fields (attempt_count, first_attempt_at, last_attempt_at,
 * blocked) are deliberately left alone so the switch cannot be used to reset
 * them. provider_ref is cleared so a late approval for the old buyer-ID
 * attempt no longer matches any verification state.
 */
export default async function (req: Request): Promise<Response> {
  try {
    const base44 = createClientFromRequest(req);

    const user = await base44.auth.me();
    if (!user?.email) {
      return Response.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const traders = await base44.asServiceRole.entities.Trader.filter({ user_email: user.email });
    const trader = traders?.[0];
    if (!trader) {
      return Response.json({ error: 'No profile found' }, { status: 404 });
    }

    if (trader.account_type === 'trader') {
      return Response.json({ state: 'already_trader' });
    }

    const now = new Date().toISOString();

    await base44.asServiceRole.entities.Trader.update(trader.id, {
      account_type: 'trader',
      verified: false,
      verified_as: '',
      subscription_tier: 'none',
    });

    const state = (
      await base44.asServiceRole.entities.Verification.filter({ trader_id: trader.id })
    )?.[0] ?? null;
    if (state) {
      await base44.asServiceRole.entities.Verification.update(state.id, {
        status: 'none',
        document_type: '',
        provider_ref: '',
        decline_reason: '',
        decline_reason_code: null,
      });
    }

    const attempts = await base44.asServiceRole.entities.VerificationAttempt.filter({
      trader_id: trader.id,
    });
    for (const attempt of (attempts || []).filter((a: any) => a.outcome === 'submitted')) {
      await base44.asServiceRole.entities.VerificationAttempt.update(attempt.id, {
        outcome: 'abandoned',
        reason: 'Account switched to trader',
        decided_at: now,
        document_uris: [],
      });
    }

    console.log(`upgradeToTrader: trader=${trader.id} switched to trader`);

    return Response.json({ state: 'upgraded' });
  } catch (error: any) {
    console.error('upgradeToTrader failed', error);
    return Response.json({ error: 'Could not switch account.' }, { status: 500 });
  }
}
