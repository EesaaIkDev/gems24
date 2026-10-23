// Platinum is for businesses only; Gold is the top plan for individual traders.
import { assert, assertEquals } from 'jsr:@std/assert@1';
import { db, reset, state } from './mock.ts';
import storeWebhook from '../../base44/functions/storeWebhook/entry.ts';
import redeemDiscountCode from '../../base44/functions/redeemDiscountCode/entry.ts';
import upgradeToBusiness from '../../base44/functions/upgradeToBusiness/entry.ts';
import stampListing from '../../base44/functions/stampListing/entry.ts';
import curatePlatinum from '../../base44/functions/curatePlatinum/entry.ts';
import { businessFields, listingStamp, tierAllowed } from '../../base44/shared/traders.ts';

Deno.env.set('STORE_WEBHOOK_SECRET', 'shh');

const call = async (fn: (r: Request) => Promise<Response>, body: unknown, headers: HeadersInit = {}) => {
  const res = await fn(new Request('http://x', { method: 'POST', body: JSON.stringify(body), headers }));
  return { status: res.status, body: await res.json() };
};
const store = (product_id: string, type = 'INITIAL_PURCHASE') =>
  call(storeWebhook, { event: { id: crypto.randomUUID(), type, app_user_id: 'T', product_id } }, { authorization: 'Bearer shh' });

const ME = { id: 'u1', email: 'me@x.com', role: 'user' };
const ADMIN = { id: 'admin', email: 'admin@x.com', role: 'admin' };
const trader = () => db.Trader.find((t) => t.id === 'T')!;
const seed = (extra: Record<string, unknown> = {}) => {
  reset();
  db.Trader = [{ id: 'T', full_name: 'Me', user_email: ME.email, created_by_id: ME.id, account_type: 'trader', subscription_tier: 'none', ...extra }];
};

Deno.test('plans: Platinum only for businesses, Bronze–Gold only for individuals', () => {
  const individual = { account_type: 'trader', trader_kind: 'individual' };
  const legacy = { account_type: 'trader' };
  const business = { account_type: 'trader', trader_kind: 'business' };
  for (const t of ['bronze', 'silver', 'gold']) {
    assert(tierAllowed(individual, t) && tierAllowed(legacy, t), t);
    assert(!tierAllowed(business, t), `business ${t}`);
  }
  assert(tierAllowed(business, 'platinum'));
  assert(!tierAllowed(individual, 'platinum') && !tierAllowed(legacy, 'platinum'));
  assert(!tierAllowed({ account_type: 'buyer', trader_kind: 'business' }, 'platinum'));
});

Deno.test('store: refuses Platinum for an individual and Gold for a business', async () => {
  seed();
  await store('platinum');
  assertEquals(trader().subscription_tier, 'none');
  await store('gold');
  assertEquals(trader().subscription_tier, 'gold');

  seed({ trader_kind: 'business' });
  await store('gold');
  assertEquals(trader().subscription_tier, 'none');
  await store('platinum');
  assertEquals(trader().subscription_tier, 'platinum');
  assertEquals(db.StorePurchase.map((p) => p.tier), ['refused:gold', 'platinum']);
});

Deno.test('store: a business on Platinum cannot schedule a downgrade to a trader plan', async () => {
  seed({ trader_kind: 'business', subscription_tier: 'platinum' });
  await call(storeWebhook, { event: { id: 'e1', type: 'PRODUCT_CHANGE', app_user_id: 'T', product_id: 'platinum', new_product_id: 'gold' } }, { authorization: 'Bearer shh' });
  assertEquals(trader().pending_tier, undefined);
});

Deno.test('codes: Platinum codes only for businesses', async () => {
  seed();
  state.user = ME;
  db.DiscountCode = [{ id: 'D', code: 'ABC123', tiers: ['platinum', 'gold'], percent_off: 100, active: true }];
  const denied = await call(redeemDiscountCode, { code: 'ABC123', tier: 'platinum' });
  assertEquals([denied.body.state, denied.body.reason], ['wrong_tier', 'Platinum is for registered businesses.']);
  assertEquals(trader().subscription_tier, 'none');
  assertEquals((await call(redeemDiscountCode, { code: 'ABC123', tier: 'gold' })).body.state, 'granted');
});

Deno.test('upgradeToBusiness: own account, needs a registered name, one way', async () => {
  seed({ subscription_tier: 'gold' });
  assertEquals((await call(upgradeToBusiness, { legal_business_name: 'X' })).status, 401);
  state.user = ME;
  assertEquals((await call(upgradeToBusiness, { business_name: 'No legal name' })).status, 400);
  const res = await call(upgradeToBusiness, {
    legal_business_name: '  Gem House (Pvt) Ltd ', business_type: 'private_limited', year_founded: 1999,
    team_size: '11-50', website: 'gemhouse.example', contact_role: 'Director', registration_number: 'PV 1',
    trader_kind: 'individual', subscription_tier: 'platinum', verified: true,
  });
  assertEquals(res.body.state, 'upgraded');
  const t = trader();
  assertEquals([t.trader_kind, t.legal_business_name, t.business_name, t.website], ['business', 'Gem House (Pvt) Ltd', 'Gem House (Pvt) Ltd', 'https://gemhouse.example']);
  assertEquals([t.subscription_tier, t.verified], ['gold', undefined], 'body fields can never grant a plan or badge');
  assertEquals((await call(upgradeToBusiness, { legal_business_name: 'Again' })).body.state, 'already_business');

  seed({ account_type: 'buyer' });
  state.user = ME;
  assertEquals((await call(upgradeToBusiness, { legal_business_name: 'Buyer Co' })).status, 409);
});

Deno.test('businessFields: cleans input and rejects bad years and websites', () => {
  const ok = businessFields({ legal_business_name: 'Co', year_founded: 3000, team_size: 'lots', business_type: 'cartel' });
  assertEquals([ok.fields!.year_founded, ok.fields!.team_size, ok.fields!.business_type], [null, '', '']);
  assert(businessFields({ legal_business_name: 'Co', website: 'http://[bad' }).error);
});

Deno.test('listings: businesses list under their company name', () => {
  const stamp = listingStamp({ account_type: 'trader', trader_kind: 'business', full_name: 'Ana', business_name: 'Gem House', subscription_tier: 'platinum' });
  assertEquals(stamp.trader_name, 'Gem House');
  assertEquals(listingStamp({ account_type: 'trader', full_name: 'Ana', business_name: 'Side name' }).trader_name, 'Ana');
});

Deno.test('listings: demo listings pass the owner check only when both sides are demo', async () => {
  reset();
  db.Trader = [{ id: 'D', full_name: 'Demo', account_type: 'trader', trader_kind: 'business', subscription_tier: 'platinum', is_demo: true }];
  db.Listing = [
    { id: 'OK', trader_id: 'D', status: 'available', is_demo: true },
    { id: 'FAKE', trader_id: 'D', status: 'available', created_by_id: 'u-eve' },
  ];
  await call(stampListing, { listing_id: 'OK', event_type: 'create' });
  await call(stampListing, { listing_id: 'FAKE', event_type: 'create' });
  assertEquals(db.Listing.map((l) => l.id), ['OK']);
});

// ---------------------------------------------------------------- clean-up

function seedLive() {
  reset();
  db.Trader = [
    { id: '6a661a334a05abbcc5e2c5e3', full_name: 'Ravi Perera', business_name: 'Ceylon Blue Gems', account_type: 'trader', subscription_tier: 'platinum' },
    { id: '6aba8238ae2f27b4f625ef14', full_name: 'Nasma Riyaz', account_type: 'trader', subscription_tier: 'platinum', created_by_id: 'u-n' },
    { id: 'OTHER', full_name: 'Someone', account_type: 'trader', subscription_tier: 'gold', created_by_id: 'u-o' },
  ];
  db.Listing = [
    { id: 'R1', trader_id: '6a661a334a05abbcc5e2c5e3' }, { id: 'R2', trader_id: '6a661a334a05abbcc5e2c5e3' },
    { id: 'N1', trader_id: '6aba8238ae2f27b4f625ef14', trader_tier: 'platinum' }, { id: 'O1', trader_id: 'OTHER' },
  ];
  db.Conversation = [{ id: 'C', participant_a_id: '6a661a334a05abbcc5e2c5e3', participant_b_id: 'OTHER' }];
  db.Message = [{ id: 'M', conversation_id: 'C' }];
  db.Connection = [{ id: 'K', requester_id: 'OTHER', recipient_id: '6a661a334a05abbcc5e2c5e3' }];
  db.Verification = [{ id: 'V', trader_id: '6a661a334a05abbcc5e2c5e3' }];
}

Deno.test('curatePlatinum: admin only, needs RUN', async () => {
  seedLive();
  state.user = ME;
  assertEquals((await call(curatePlatinum, { confirm: 'RUN' })).status, 403);
  state.user = ADMIN;
  assertEquals((await call(curatePlatinum, {})).status, 400);
  assertEquals(db.Trader.length, 3, 'nothing changed');
});

Deno.test('curatePlatinum: deletes Ravi with everything he owns, moves Nasma to Gold, adds 5 × 6 demo businesses', async () => {
  seedLive();
  state.user = ADMIN;
  const res = await call(curatePlatinum, { confirm: 'RUN' });
  assertEquals(res.body.ravi, { deleted: { listings: 2, conversations: 1, messages: 1, connections: 1 } });
  assertEquals(res.body.nasma, 'moved to Gold');
  assertEquals(res.body.sample_businesses_added.length, 5);
  assertEquals(res.body.other_platinum_individuals, []);

  assert(!db.Trader.some((t) => t.full_name === 'Ravi Perera'));
  assertEquals([db.Conversation.length, db.Message.length, db.Connection.length, db.Verification.length], [0, 0, 0, 0]);
  const nasma = db.Trader.find((t) => t.full_name === 'Nasma Riyaz')!;
  assertEquals([nasma.subscription_tier, nasma.trader_kind], ['gold', 'individual']);
  assertEquals(db.Listing.find((l) => l.id === 'N1')!.trader_tier, 'gold');

  const demo = db.Trader.filter((t) => t.is_demo);
  assertEquals(demo.length, 5);
  for (const t of demo) {
    assertEquals([t.trader_kind, t.subscription_tier, t.verified, t.user_email], ['business', 'platinum', false, '']);
    assert(t.legal_business_name && t.full_name && t.contact_role);
    const listings = db.Listing.filter((l) => l.trader_id === t.id);
    assertEquals(listings.length, 6);
    for (const l of listings) {
      assertEquals([l.is_demo, l.trader_verified, l.trader_tier, l.trader_name, l.photos.length], [true, false, 'platinum', t.business_name, 0]);
    }
  }

  // Idempotent
  const again = await call(curatePlatinum, { confirm: 'RUN' });
  assertEquals([again.body.ravi, again.body.sample_businesses_added.length], ['already removed', 0]);
  assertEquals(db.Trader.filter((t) => t.is_demo).length, 5);

  // Before launch
  assertEquals((await call(curatePlatinum, { action: 'remove_demo' })).status, 400);
  const removed = await call(curatePlatinum, { action: 'remove_demo', confirm: 'REMOVE' });
  assertEquals(removed.body.removed, { businesses: 5, listings: 30 });
  assertEquals(db.Trader.map((t) => t.full_name).sort(), ['Nasma Riyaz', 'Someone']);
  assertEquals(db.Listing.map((l) => l.id).sort(), ['N1', 'O1']);
});
