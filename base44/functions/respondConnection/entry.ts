import { createClientFromRequest } from 'npm:@base44/sdk@0.8.52';
import { sessionTrader } from '../../shared/traders.ts';

/**
 * Accepts or declines a pending network request. Only the recipient can
 * answer; declining deletes the row so the requester sees no negative signal.
 */
export default async function (req: Request): Promise<Response> {
  try {
    const base44 = createClientFromRequest(req);
    const { user, trader } = await sessionTrader(base44);
    if (!user) return Response.json({ error: 'Unauthorized' }, { status: 401 });
    if (!trader) return Response.json({ error: 'No profile found' }, { status: 404 });

    const { connection_id, accept } = await req.json().catch(() => ({}));
    const rows = await base44.asServiceRole.entities.Connection.filter({ id: String(connection_id || '') });
    const c = rows?.[0];
    if (!c || c.recipient_id !== trader.id) {
      return Response.json({ error: 'Not found' }, { status: 404 });
    }
    if (c.status !== 'pending') return Response.json({ connection: c });

    if (!accept) {
      await base44.asServiceRole.entities.Connection.delete(c.id);
      return Response.json({ connection: null });
    }
    const connection = await base44.asServiceRole.entities.Connection.update(c.id, { status: 'accepted' });
    return Response.json({ connection: { ...c, ...connection, status: 'accepted' } });
  } catch (error: any) {
    console.error('respondConnection failed', error);
    return Response.json({ error: 'Could not update request.' }, { status: 500 });
  }
}
