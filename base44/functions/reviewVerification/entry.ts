import { createClientFromRequest } from 'npm:@base44/sdk@0.8.52';
import { grantBadge } from '../../shared/shufti.ts';

/**
 * Admin decisions on verifications Shufti couldn't settle alone. Admin only.
 *
 *   list        accounts waiting on an admin
 *   approve     first-screening AML match was a false positive → grant badge
 *   decline     first-screening AML match confirmed → no badge
 *   clear_flag  post-approval AML flag was a false positive → keep badge
 *   revoke      post-approval flag confirmed → remove badge
 *   reset_all   before production: clear every badge and verification so all
 *               users re-verify through Shufti (requires confirm: "RESET")
 */

const PAGE = 200;
async function all(entity: any) {
  const rows: any[] = [];
  for (let skip = 0; ; skip += PAGE) {
    const page = await entity.list('created_date', PAGE, skip);
    rows.push(...(page || []));
    if (!page || page.length < PAGE) return rows;
  }
}

export default async function (req: Request): Promise<Response> {
  try {
    const base44 = createClientFromRequest(req);
    const admin = await base44.auth.me().catch(() => null);
    if (admin?.role !== 'admin') return Response.json({ error: 'Forbidden' }, { status: 403 });

    const { action, trader_id, note, confirm } = await req.json().catch(() => ({}));
    const svc = base44.asServiceRole.entities;
    const now = new Date().toISOString();
    const audit = { reviewed_by: admin.email, reviewed_at: now, review_note: String(note || '').slice(0, 1000) };

    if (action === 'list') {
      const traders = await all(svc.Trader);
      const flagged = new Set(traders.filter((t: any) => t.aml_flagged).map((t: any) => t.id));
      const byId = Object.fromEntries(traders.map((t: any) => [t.id, t]));
      const rows = (await all(svc.Verification))
        .filter((v: any) => v.status === 'review' || flagged.has(v.trader_id))
        .map((v: any) => ({
          trader_id: v.trader_id,
          name: byId[v.trader_id]?.business_name || byId[v.trader_id]?.full_name || '',
          kind: flagged.has(v.trader_id) ? 'post_approval_flag' : 'first_screening',
          level: v.level,
          kyc_status: v.kyc_status,
          kyb_status: v.kyb_status,
          aml_status: v.aml_status,
          reason: v.review_reason || '',
          shufti_reference: v.provider_ref,
          since: v.last_decision_at || v.updated_date,
        }));
      return Response.json({ rows });
    }

    if (action === 'reset_all') {
      if (confirm !== 'RESET') return Response.json({ error: 'Send confirm: "RESET"' }, { status: 400 });
      let traders = 0;
      for (const t of await all(svc.Trader)) {
        if (t.verified || t.verified_level || t.aml_flagged || t.verified_as) {
          await svc.Trader.update(t.id, { verified: false, verified_as: '', verified_level: '', aml_flagged: false });
          traders++;
        }
      }
      let states = 0;
      for (const v of await all(svc.Verification)) {
        await svc.Verification.update(v.id, {
          status: 'none', level: '', kyc_status: 'none', kyb_status: 'none', aml_status: 'none',
          provider_ref: '', verification_url: '', attempt_count: 0, blocked: false,
          last_attempt_at: null, decline_reason: '', review_reason: '', ...audit,
        });
        states++;
      }
      console.log(`reviewVerification: reset_all by ${admin.email} traders=${traders} states=${states}`);
      return Response.json({ ok: true, traders, states });
    }

    const trader = (await svc.Trader.filter({ id: String(trader_id || '') }))?.[0];
    const state = trader && (await svc.Verification.filter({ trader_id: trader.id }))?.[0];
    if (!trader || !state) return Response.json({ error: 'Not found' }, { status: 404 });

    if (action === 'approve' || action === 'decline') {
      if (state.status !== 'review') return Response.json({ error: 'Nothing waiting for review' }, { status: 409 });
      const identityOk = state.kyc_status === 'passed' && ['passed', 'none'].includes(state.kyb_status);
      if (action === 'approve' && identityOk) {
        await svc.Verification.update(state.id, { status: 'approved', aml_status: 'passed', review_reason: '', ...audit });
        await grantBadge(base44, trader, state.level);
      } else {
        await svc.Verification.update(state.id, {
          status: 'declined', aml_status: action === 'decline' ? 'failed' : state.aml_status,
          decline_reason: 'We could not complete your verification. Please contact support.',
          review_reason: '', ...audit,
        });
      }
      console.log(`reviewVerification: ${action} trader=${trader.id} by ${admin.email}`);
      return Response.json({ ok: true, granted: action === 'approve' && identityOk });
    }

    if (action === 'clear_flag' || action === 'revoke') {
      if (!trader.aml_flagged) return Response.json({ error: 'Account is not flagged' }, { status: 409 });
      if (action === 'clear_flag') {
        await svc.Trader.update(trader.id, { aml_flagged: false });
        await svc.Verification.update(state.id, {
          ...(state.aml_status === 'flagged' ? { aml_status: 'passed' } : {}), review_reason: '', ...audit,
        });
      } else {
        await svc.Trader.update(trader.id, { verified: false, verified_as: '', verified_level: '', aml_flagged: false });
        await svc.Verification.update(state.id, {
          status: 'declined', aml_status: state.aml_status === 'flagged' ? 'failed' : state.aml_status,
          decline_reason: 'Your verification was withdrawn after review. Please contact support.',
          review_reason: '', ...audit,
        });
      }
      console.log(`reviewVerification: ${action} trader=${trader.id} by ${admin.email}`);
      return Response.json({ ok: true });
    }

    return Response.json({ error: 'Unknown action' }, { status: 400 });
  } catch (error: any) {
    console.error('reviewVerification failed', error);
    return Response.json({ error: 'Review failed' }, { status: 500 });
  }
}
