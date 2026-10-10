import { assertEquals } from 'jsr:@std/assert@1';
import { deliveryStatus } from '../../src/lib/messageDelivery.js';

const first = { id: 'M1', created_date: '2026-01-01T00:00:00Z' };
const second = { id: 'M2', created_date: '2026-01-02T00:00:00Z' };
const base = { participant_a_id: 'A', participant_b_id: 'B' };

Deno.test('outgoing message: one blank tick until the recipient receives it', () => {
  assertEquals(deliveryStatus(first, base, 'A', true), 'sent');
  assertEquals(deliveryStatus(first, {
    ...base, delivered_at_b: first.created_date, delivered_message_id_b: first.id,
  }, 'A', true), 'delivered');
});

Deno.test('outgoing messages: two green ticks only after recipient reads them', () => {
  const c = {
    ...base,
    delivered_at_b: second.created_date, delivered_message_id_b: second.id,
    read_at_b: first.created_date, read_message_id_b: first.id,
  };
  assertEquals(deliveryStatus(first, c, 'A', true), 'read');
  assertEquals(deliveryStatus(second, c, 'A', true), 'delivered');
  assertEquals(deliveryStatus(first, c, 'A', false), 'delivered');
  assertEquals(deliveryStatus(second, { ...c, read_at_b: second.created_date, read_message_id_b: second.id }, 'A', true), 'read');
});

Deno.test('receipt watermark cannot mark a different message with the same timestamp as read', () => {
  const c = {
    ...base,
    delivered_at_b: first.created_date, delivered_message_id_b: first.id,
    read_at_b: first.created_date, read_message_id_b: first.id,
  };
  assertEquals(deliveryStatus({ id: 'other', created_date: first.created_date }, c, 'A', true), 'sent');
  assertEquals(deliveryStatus(first, c, 'B', true), 'sent');
});
