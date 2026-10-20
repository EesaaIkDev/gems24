import { assertEquals } from 'jsr:@std/assert@1';
import { haptic, isNative, native } from '../../src/lib/despia.js';

const recorder = () => {
  const sent: string[] = [];
  return { sent, run: (c: string) => sent.push(c) };
};

Deno.test('haptics: exact Despia commands for each meaning', () => {
  const { sent, run } = recorder();
  for (const type of ['light', 'heavy', 'success', 'error']) haptic(type, { enabled: true, run });
  assertEquals(sent, ['lighthaptic://', 'heavyhaptic://', 'successhaptic://', 'errorhaptic://']);
});

Deno.test('haptics: unknown types fall back to light, never an arbitrary command', () => {
  const { sent, run } = recorder();
  haptic('oauth://?url=x', { enabled: true, run });
  assertEquals(sent, ['lighthaptic://']);
});

Deno.test('haptics: no-op in a normal browser, and a bridge failure never throws', () => {
  assertEquals(isNative, false);
  const { sent, run } = recorder();
  assertEquals(haptic('heavy', { run }), false, 'defaults to the real environment: not native here');
  assertEquals(sent.length, 0);
  assertEquals(haptic('error'), false);
  const boom = () => {
    throw new Error('bridge missing');
  };
  assertEquals(native('successhaptic://', { enabled: true, run: boom }), false);
  assertEquals(native('successhaptic://', { enabled: true, run: null as any }), false);
});
