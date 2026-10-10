import { createClientFromRequest } from 'npm:@base44/sdk@0.8.52';
import { connectionBetween, sessionTrader } from '../../shared/traders.ts';

const MAX_LENGTH = 4000;

/**
 * Sends a chat message as the caller. Messages are only created here so the
 * sender can't be spoofed, nobody can post into a chat they aren't part of,
 * and the recipient's user id (used by Message read rules) comes from the
 * conversation rather than the browser.
 */
export default async function (req: Request): Promise<Response> {
  try {
    const base44 = createClientFromRequest(req);
    const { user, trader } = await sessionTrader(base44);
    if (!user) return Response.json({ error: 'Unauthorized' }, { status: 401 });
    if (!trader) return Response.json({ error: 'No profile found' }, { status: 404 });

    const { conversation_id, text } = await req.json().catch(() => ({}));
    const body = String(text || '').trim().slice(0, MAX_LENGTH);
    if (!body) return Response.json({ error: 'Empty message' }, { status: 400 });

    const c = (
      await base44.asServiceRole.entities.Conversation.filter({ id: String(conversation_id || '') })
    )?.[0];
    const isA = c?.participant_a_id === trader.id;
    if (!c || (!isA && c.participant_b_id !== trader.id)) {
      return Response.json({ error: 'Not found' }, { status: 404 });
    }
    const otherId = isA ? c.participant_b_id : c.participant_a_id;
    const connection = await connectionBetween(base44, trader.id, otherId);
    if (connection?.status !== 'accepted') {
      return Response.json({ error: 'Messaging needs an accepted connection.' }, { status: 403 });
    }

    const message = await base44.asServiceRole.entities.Message.create({
      conversation_id: c.id,
      sender_id: trader.id,
      sender_user_id: user.id,
      text: body,
      recipient_user_id: isA ? c.participant_b_user_id : c.participant_a_user_id,
    });
    const conversation = await base44.asServiceRole.entities.Conversation.update(c.id, {
      last_message: body,
      last_message_at: message.created_date,
      last_message_id: message.id,
      last_sender_id: trader.id,
      [isA ? 'unread_b' : 'unread_a']: ((isA ? c.unread_b : c.unread_a) || 0) + 1,
    });
    return Response.json({ message, conversation: { ...c, ...conversation } });
  } catch (error: any) {
    console.error('sendChatMessage failed', error);
    return Response.json({ error: 'Could not send message.' }, { status: 500 });
  }
}
