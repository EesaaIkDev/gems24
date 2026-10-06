// Checks the permission rules in the entity schemas say what the app relies on.
import { assert, assertEquals } from 'jsr:@std/assert@1';

const load = (name: string) =>
  JSON.parse(Deno.readTextFileSync(new URL(`../../base44/entities/${name}.jsonc`, import.meta.url)));
const ADMIN = { user_condition: { role: 'admin' } };
const serverOnly = (field: any) => JSON.stringify(field?.rls?.write) === JSON.stringify(ADMIN);

Deno.test('Trader: paid and referral fields are server-only', () => {
  const p = load('Trader').properties;
  for (const f of [
    'subscription_tier', 'plan_renews_at', 'pending_tier', 'pending_tier_at', 'purchased_listings',
    'referral_count', 'referral_bonus_listings', 'referral_count_year', 'referral_year_start',
    'referred_by_code', 'loyalty_years', 'loyalty_bonus_listings', 'verified', 'verified_as',
  ]) assert(serverOnly(p[f]), `${f} must be server-only`);
  assertEquals(p.account_type.rls.update, ADMIN, 'account type only changes via upgradeToTrader');
});

Deno.test('Trader: private fields are owner-only to read', () => {
  const p = load('Trader').properties;
  for (const f of ['phone', 'contact_email', 'user_email', 'active_at', 'active_conversation_id']) {
    const read = JSON.stringify(p[f]?.rls?.read || {});
    assert(read.includes('{{user.id}}') && read.includes('admin'), `${f} must be owner-only`);
  }
});

Deno.test('Listing: trader details are server-only', () => {
  const p = load('Listing').properties;
  for (const f of ['trader_name', 'trader_country', 'trader_tier', 'trader_verified']) {
    assert(serverOnly(p[f]), `${f} must be server-only`);
  }
});

Deno.test('Chats and connections: participants only, created by the server', () => {
  for (const name of ['Conversation', 'Message', 'Connection']) {
    const rls = load(name).rls;
    assertEquals(rls.create, ADMIN, `${name} create`);
    assert(rls.read && JSON.stringify(rls.read).includes('{{user.id}}'), `${name} read must be scoped`);
  }
  assertEquals(load('Connection').rls.update, ADMIN);
  assertEquals(load('Message').rls.update, ADMIN);
});
