import { createClientFromRequest } from 'npm:@base44/sdk@0.8.52';
import { sessionTrader } from '../../shared/traders.ts';

export default async function (req: Request): Promise<Response> {
  try {
    const base44 = createClientFromRequest(req);
    const { user, trader } = await sessionTrader(base44);
    if (!user) return Response.json({ error: 'Unauthorized' }, { status: 401 });
    if (!trader) return Response.json({ error: 'No profile found' }, { status: 404 });

    const { conversation_id, message_id, read } = await req.json().catch(() => ({}));
    const c = (await base44.asServiceRole.entities.Conversation.filter({ id: String(conversation_id || '') }))?.[0];
    if (!c || (c.participant_a_id !== trader.id && c.participant_b_id !== trader.id)) {
      return Response.json({ error: 'Not found' }, { status: 404 });
    }
    const message = (await base44.asServiceRole.entities.Message.filter({ id: String(message_id || '') }))?.[0];
    if (!message || message.conversation_id !== c.id || message.sender_id === trader.id ||
      message.recipient_user_id !== user.id) {
      return Response.json({ error: 'Not found' }, { status: 404 });
    }

    const side = c.participant_a_id === trader.id ? 'a' : 'b';
    const patch: Record<string, unknown> = {};
    const advance = (at: string, id: string) =>
      !c[at] || !c[id] || Date.parse(message.created_date) > Date.parse(c[at]) ||
      (message.created_date === c[at] && c[id] !== message.id);

    if (advance(`delivered_at_${side}`, `delivered_message_id_${side}`)) {
      patch[`delivered_at_${side}`] = message.created_date;
      patch[`delivered_message_id_${side}`] = message.id;
    }
    if (read === true) {
      if (trader.read_receipts !== false && advance(`read_at_${side}`, `read_message_id_${side}`)) {
        patch[`read_at_${side}`] = message.created_date;
        patch[`read_message_id_${side}`] = message.id;
      }
      const other = side === 'a' ? c.participant_b_id : c.participant_a_id;
      const newest = (await base44.asServiceRole.entities.Message.filter(
        { conversation_id: c.id, sender_id: other }, '-created_date', 1
      ))?.[0];
      if (newest?.id === message.id && c[`unread_${side}`]) patch[`unread_${side}`] = 0;
    }
    if (!Object.keys(patch).length) return Response.json({ conversation: c });
    const updated = await base44.asServiceRole.entities.Conversation.update(c.id, patch);
    return Response.json({ conversation: { ...c, ...updated } });
  } catch (error: any) {
    console.error('acknowledgeMessage failed', error);
    return Response.json({ error: 'Could not acknowledge message.' }, { status: 500 });
  }
}
