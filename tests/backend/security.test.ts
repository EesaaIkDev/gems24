// Run: deno test --allow-env --allow-read --config tests/backend/deno.json tests/backend
import { assert, assertEquals } from 'jsr:@std/assert@1';
import { db, reset, state } from './mock.ts';
import storeWebhook from '../../base44/functions/storeWebhook/entry.ts';
import stampListing from '../../base44/functions/stampListing/entry.ts';
import sendChatMessage from '../../base44/functions/sendChatMessage/entry.ts';
import openConversation from '../../base44/functions/openConversation/entry.ts';
import requestConnection from '../../base44/functions/requestConnection/entry.ts';
import respondConnection from '../../base44/functions/respondConnection/entry.ts';
import connectedProfile from '../../base44/functions/connectedProfile/entry.ts';
import pushNewMessage from '../../base44/functions/pushNewMessage/entry.ts';
import pushConnection from '../../base44/functions/pushConnection/entry.ts';
import backfillPrivacy from '../../base44/functions/backfillPrivacy/entry.ts';
import syncTraderListings from '../../base44/functions/syncTraderListings/entry.ts';

Deno.env.set('STORE_WEBHOOK_SECRET', 'shh');

const call = async (fn: (r: Request) => Promise<Response>, body: unknown, headers: HeadersInit = {}) => {
  const res = await fn(new Request('http://x', { method: 'POST', body: JSON.stringify(body), headers }));
  return { status: res.status, body: await res.json() };
};
const store = (event: Record<string, unknown>) =>
  call(storeWebhook, { event: { id: crypto.randomUUID(), app_user_id: 'T1', ...event } }, { authorization: 'Bearer shh' });
const trader = () => db.Trader.find((t) => t.id === 'T1')!;
const YEAR = Date.UTC(2027, 0, 1);

const ALICE = { id: 'u-alice', email: 'alice@x.com', role: 'user' };
const BOB = { id: 'u-bob', email: 'bob@x.com', role: 'user' };
const EVE = { id: 'u-eve', email: 'eve@x.com', role: 'user' };

function seedPeople() {
  db.Trader = [
    { id: 'A', full_name: 'Alice', user_email: ALICE.email, created_by_id: ALICE.id, account_type: 'trader', subscription_tier: 'gold', contact_email: 'a@biz.com', phone: '+94 111', active_at: '2026-01-01T00:00:00Z' },
    { id: 'B', full_name: 'Bob', user_email: BOB.email, created_by_id: BOB.id, account_type: 'trader', subscription_tier: 'silver', contact_email: 'b@biz.com', phone: '+94 222' },
    { id: 'E', full_name: 'Eve', user_email: EVE.email, created_by_id: EVE.id, account_type: 'trader', subscription_tier: 'bronze' },
  ];
}

// ---------------------------------------------------------------- plans

Deno.test('store: rejects calls without the webhook secret', async () => {
  reset();
  const res = await call(storeWebhook, { event: { id: 'e', type: 'RENEWAL', app_user_id: 'T1', product_id: 'platinum' } });
  assertEquals(res.status, 401);
});

Deno.test('store: upgrade applies immediately, keeps loyalty streak, no bonus', async () => {
  reset();
  db.Trader = [{ id: 'T1', account_type: 'trader', subscription_tier: 'gold', loyalty_years: 2, loyalty_bonus_listings: 30 }];
  // App Store upgrade: arrives as RENEWAL with the higher product.
  await store({ type: 'RENEWAL', product_id: 'platinum', expiration_at_ms: YEAR });
  assertEquals(trader().subscription_tier, 'platinum');
  assertEquals(trader().loyalty_years, 2);
  assertEquals(trader().loyalty_bonus_listings, 30);
  assertEquals(trader().plan_renews_at, new Date(YEAR).toISOString());
});

Deno.test('store: downgrade waits for the anniversary, then counts as a renewal year', async () => {
  reset();
  db.Trader = [{ id: 'T1', account_type: 'trader', subscription_tier: 'gold', loyalty_years: 1, loyalty_bonus_listings: 0 }];
  await store({ type: 'PRODUCT_CHANGE', product_id: 'gold', new_product_id: 'silver', expiration_at_ms: YEAR });
  assertEquals(trader().subscription_tier, 'gold', 'grade unchanged until the plan year ends');
  assertEquals(trader().pending_tier, 'silver');
  assertEquals(trader().pending_tier_at, new Date(YEAR).toISOString());

  await store({ type: 'RENEWAL', product_id: 'silver', expiration_at_ms: YEAR + 365 * 864e5 });
  assertEquals(trader().subscription_tier, 'silver');
  assertEquals(trader().pending_tier, '');
  assertEquals(trader().loyalty_years, 2);
  assertEquals(trader().loyalty_bonus_listings, 15, 'silver loyalty step for year 2');
});

Deno.test('store: switching back up clears a scheduled downgrade', async () => {
  reset();
  db.Trader = [{ id: 'T1', account_type: 'trader', subscription_tier: 'gold', pending_tier: 'silver', loyalty_years: 1 }];
  await store({ type: 'PRODUCT_CHANGE', product_id: 'silver', new_product_id: 'gold' });
  assertEquals(trader().pending_tier, '');
  assertEquals(trader().subscription_tier, 'gold');
});

Deno.test('store: PRODUCT_CHANGE to a higher grade grants nothing by itself', async () => {
  reset();
  db.Trader = [{ id: 'T1', account_type: 'trader', subscription_tier: 'gold', loyalty_years: 1 }];
  await store({ type: 'PRODUCT_CHANGE', product_id: 'gold', new_product_id: 'platinum' });
  assertEquals(trader().subscription_tier, 'gold');
});

Deno.test('store: Google upgrade — old product expiring does not wipe the new plan', async () => {
  reset();
  db.Trader = [{ id: 'T1', account_type: 'trader', subscription_tier: 'gold', loyalty_years: 3 }];
  await store({ type: 'INITIAL_PURCHASE', product_id: 'platinum', expiration_at_ms: YEAR });
  assertEquals(trader().subscription_tier, 'platinum');
  assertEquals(trader().loyalty_years, 3, 'upgrade keeps the streak');
  await store({ type: 'EXPIRATION', product_id: 'gold' });
  assertEquals(trader().subscription_tier, 'platinum');
  await store({ type: 'EXPIRATION', product_id: 'platinum' });
  assertEquals(trader().subscription_tier, 'none');
  assertEquals(trader().loyalty_years, 0);
});

Deno.test('store: never grants a plan to a buyer account', async () => {
  reset();
  db.Trader = [{ id: 'T1', account_type: 'buyer', subscription_tier: 'none' }];
  await store({ type: 'INITIAL_PURCHASE', product_id: 'gold' });
  assertEquals(trader().subscription_tier, 'none');
});

// ---------------------------------------------------------------- listings

const listing = (id: string, extra: Record<string, unknown> = {}) => ({
  id, trader_id: 'A', created_by_id: ALICE.id, status: 'available', ...extra,
});

Deno.test('listings: one placed under someone else\'s trader is removed', async () => {
  reset(); seedPeople();
  db.Listing = [listing('L1', { created_by_id: EVE.id })];
  await call(stampListing, { listing_id: 'L1', event_type: 'create' });
  assertEquals(db.Listing.length, 0);
});

Deno.test('listings: buyer accounts cannot list', async () => {
  reset(); seedPeople();
  db.Trader[0].account_type = 'buyer';
  db.Listing = [listing('L1')];
  await call(stampListing, { listing_id: 'L1', event_type: 'create' });
  assertEquals(db.Listing.length, 0);
});

Deno.test('listings: forged badge and grade are overwritten from the trader', async () => {
  reset(); seedPeople();
  db.Listing = [listing('L1', { trader_verified: true, trader_tier: 'platinum', trader_name: 'Fake' })];
  await call(stampListing, { listing_id: 'L1', event_type: 'create' });
  assertEquals(db.Listing[0].trader_verified, false);
  assertEquals(db.Listing[0].trader_tier, 'gold');
  assertEquals(db.Listing[0].trader_name, 'Alice');
});

Deno.test('listings: placement sorts higher grades first, then newest', async () => {
  reset(); seedPeople();
  db.Listing = [
    listing('GOLD_OLD', { created_date: '2026-01-01T00:00:00Z' }),
    listing('GOLD_NEW', { created_date: '2026-06-01T00:00:00Z' }),
    { id: 'BRONZE_NEWEST', trader_id: 'E', created_by_id: EVE.id, status: 'available', created_date: '2026-09-01T00:00:00Z' },
  ];
  for (const l of [...db.Listing]) await call(stampListing, { listing_id: l.id, event_type: 'create' });
  const order = [...db.Listing].sort((a, b) => b.placement - a.placement).map((l) => l.id);
  assertEquals(order, ['GOLD_NEW', 'GOLD_OLD', 'BRONZE_NEWEST']);
});

Deno.test('listings: a grade change re-sorts the trader\'s listings', async () => {
  reset(); seedPeople();
  db.Listing = [listing('L', { created_date: '2026-01-01T00:00:00Z' })];
  await call(stampListing, { listing_id: 'L', event_type: 'create' });
  const before = db.Listing[0].placement;
  db.Trader[0].subscription_tier = 'platinum';
  await call(syncTraderListings, { trader_id: 'A' });
  assert(db.Listing[0].placement > before);
  assertEquals(db.Listing[0].trader_tier, 'platinum');
});

Deno.test('listings: over capacity — new listing removed, reactivated one goes back to sold', async () => {
  reset(); seedPeople();
  db.Trader[0].subscription_tier = 'bronze'; // 25
  db.Listing = Array.from({ length: 25 }, (_, i) => listing(`L${i}`));
  db.Listing.push(listing('NEW'));
  await call(stampListing, { listing_id: 'NEW', event_type: 'create' });
  assert(!db.Listing.some((l) => l.id === 'NEW'));

  db.Listing.push(listing('OLD', { status: 'available' }));
  await call(stampListing, { listing_id: 'OLD', event_type: 'update' });
  assertEquals(db.Listing.find((l) => l.id === 'OLD')!.status, 'sold');
});

Deno.test('listings: a scheduled downgrade\'s lower limit already applies', async () => {
  reset(); seedPeople();
  db.Trader[0].pending_tier = 'bronze'; // gold now, bronze (25) pending
  db.Listing = Array.from({ length: 25 }, (_, i) => listing(`L${i}`));
  db.Listing.push(listing('NEW'));
  await call(stampListing, { listing_id: 'NEW', event_type: 'create' });
  assert(!db.Listing.some((l) => l.id === 'NEW'));
});

Deno.test('listings: bonus slots count toward capacity', async () => {
  reset(); seedPeople();
  Object.assign(db.Trader[0], { subscription_tier: 'bronze', purchased_listings: 1 });
  db.Listing = Array.from({ length: 26 }, (_, i) => listing(`L${i}`));
  await call(stampListing, { listing_id: 'L25', event_type: 'create' });
  assert(db.Listing.some((l) => l.id === 'L25'));
});

// ---------------------------------------------------------------- network + chat

Deno.test('connections: only the recipient can accept', async () => {
  reset(); seedPeople();
  state.user = ALICE;
  const { body } = await call(requestConnection, { trader_id: 'B' });
  const c = body.connection;
  assertEquals([c.requester_user_id, c.recipient_user_id, c.status], [ALICE.id, BOB.id, 'pending']);

  state.user = ALICE; // the requester can't accept their own request
  assertEquals((await call(respondConnection, { connection_id: c.id, accept: true })).status, 404);
  state.user = EVE;
  assertEquals((await call(respondConnection, { connection_id: c.id, accept: true })).status, 404);
  state.user = BOB;
  await call(respondConnection, { connection_id: c.id, accept: true });
  assertEquals(db.Connection[0].status, 'accepted');
});

Deno.test('chat: needs an accepted connection; outsiders cannot post', async () => {
  reset(); seedPeople();
  state.user = ALICE;
  assertEquals((await call(openConversation, { trader_id: 'B' })).status, 403);

  db.Connection = [{ id: 'K', requester_id: 'A', recipient_id: 'B', status: 'accepted' }];
  const { body } = await call(openConversation, { trader_id: 'B', context_path: 'https://evil.example' });
  const convo = body.conversation;
  assertEquals([convo.participant_a_user_id, convo.participant_b_user_id], [ALICE.id, BOB.id]);
  assertEquals(convo.context_path, '', 'only in-app paths are kept');

  state.user = EVE;
  assertEquals((await call(sendChatMessage, { conversation_id: convo.id, text: 'hi' })).status, 404);

  state.user = ALICE;
  const sent = await call(sendChatMessage, { conversation_id: convo.id, text: '  hello  ' });
  assertEquals(sent.body.message.sender_id, 'A');
  assertEquals(sent.body.message.recipient_user_id, BOB.id);
  assertEquals(sent.body.message.text, 'hello');
  assertEquals(db.Conversation[0].unread_b, 1);
});

Deno.test('chat: messaging stops if the connection is removed', async () => {
  reset(); seedPeople();
  db.Conversation = [{ id: 'C', participant_a_id: 'A', participant_b_id: 'B', participant_a_user_id: ALICE.id, participant_b_user_id: BOB.id }];
  state.user = ALICE;
  assertEquals((await call(sendChatMessage, { conversation_id: 'C', text: 'hi' })).status, 403);
});

Deno.test('contact details: shared with accepted connections only, never the phone', async () => {
  reset(); seedPeople();
  state.user = EVE;
  assertEquals((await call(connectedProfile, { trader_id: 'A' })).body, { connected: false });

  db.Connection = [{ id: 'K', requester_id: 'B', recipient_id: 'A', status: 'pending' }];
  state.user = BOB;
  assertEquals((await call(connectedProfile, { trader_id: 'A' })).body, { connected: false });

  db.Connection[0].status = 'accepted';
  const { body } = await call(connectedProfile, { trader_id: 'A' });
  assertEquals(body.contact_email, 'a@biz.com');
  assertEquals(body.active_at, '2026-01-01T00:00:00Z');
  assert(!('phone' in body));
});

// ---------------------------------------------------------------- push spam

Deno.test('push: each message and each connection status is pushed once', async () => {
  reset(); seedPeople();
  db.Conversation = [{ id: 'C', participant_a_id: 'A', participant_b_id: 'B' }];
  db.Message = [{ id: 'M', conversation_id: 'C', sender_id: 'A', text: 'hi', created_date: new Date().toISOString() }];
  await call(pushNewMessage, { message_id: 'M' });
  await call(pushNewMessage, { message_id: 'M' });
  assertEquals(state.pushes.length, 1);

  db.Message.push({ id: 'OLD', conversation_id: 'C', sender_id: 'A', text: 'x', created_date: '2020-01-01T00:00:00Z' });
  await call(pushNewMessage, { message_id: 'OLD' });
  assertEquals(state.pushes.length, 1, 'stale messages are not pushed');

  db.Connection = [{ id: 'K', requester_id: 'A', recipient_id: 'B', status: 'pending' }];
  await call(pushConnection, { connection_id: 'K' });
  await call(pushConnection, { connection_id: 'K' });
  assertEquals(state.pushes.length, 2);
});

Deno.test('push: muted while the recipient has the chat open, even between heartbeats', async () => {
  reset(); seedPeople();
  db.Conversation = [{ id: 'C', participant_a_id: 'A', participant_b_id: 'B' }];
  // Bob opened the chat 3 minutes ago — presence is only rewritten every few minutes now.
  Object.assign(db.Trader[1], { active_conversation_id: 'C', active_at: new Date(Date.now() - 3 * 60e3).toISOString() });
  db.Message = [{ id: 'M', conversation_id: 'C', sender_id: 'A', text: 'hi', created_date: new Date().toISOString() }];
  await call(pushNewMessage, { message_id: 'M' });
  assertEquals(state.pushes.length, 0);

  // Left the chat (id cleared): pushed.
  db.Trader[1].active_conversation_id = '';
  db.Message.push({ id: 'M2', conversation_id: 'C', sender_id: 'A', text: 'hi', created_date: new Date().toISOString() });
  await call(pushNewMessage, { message_id: 'M2' });
  assertEquals(state.pushes.length, 1);
});

// ---------------------------------------------------------------- migration

Deno.test('backfill: admin only; stamps owners onto existing chats and connections', async () => {
  reset(); seedPeople();
  db.Conversation = [{ id: 'C', participant_a_id: 'A', participant_b_id: 'B' }];
  db.Message = [{ id: 'M', conversation_id: 'C', sender_id: 'B', text: 'hi' }];
  db.Connection = [{ id: 'K', requester_id: 'A', recipient_id: 'B', status: 'accepted' }];
  db.Listing = [listing('L', { trader_verified: true })];

  state.user = ALICE;
  assertEquals((await call(backfillPrivacy, {})).status, 403);

  state.user = { id: 'admin', email: 'admin@x.com', role: 'admin' };
  await call(backfillPrivacy, {});
  assertEquals([db.Conversation[0].participant_a_user_id, db.Conversation[0].participant_b_user_id], [ALICE.id, BOB.id]);
  assertEquals(db.Message[0].recipient_user_id, ALICE.id);
  assertEquals(db.Message[0].push_sent, true);
  assertEquals([db.Connection[0].requester_user_id, db.Connection[0].recipient_user_id], [ALICE.id, BOB.id]);
  assertEquals(db.Listing[0].trader_verified, false);
});
