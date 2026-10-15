import { assertEquals } from 'jsr:@std/assert@1';
import { openExternal } from '../../src/lib/openExternal.js';

const fakeWindow = (opens: boolean) => {
  const calls: string[] = [];
  return {
    calls,
    win: <any>{
      open: (url: string, target: string) => (calls.push(`open:${url}:${target}`), opens ? { opener: {} } : null),
      location: { assign: (url: string) => calls.push(`assign:${url}`) },
    },
  };
};

Deno.test('openExternal: native app always uses window.open(_blank), never location', () => {
  const { win, calls } = fakeWindow(false); // Despia intercepts; open() may return null
  assertEquals(openExternal('https://app.shuftipro.com/verify/x', { native: true, win }), 'native');
  assertEquals(calls, ['open:https://app.shuftipro.com/verify/x:_blank']);
});

Deno.test('openExternal: web opens a tab, falls back to same tab if blocked', () => {
  const ok = fakeWindow(true);
  assertEquals(openExternal('https://app.shuftipro.com/v', { win: ok.win }), 'tab');
  const blocked = fakeWindow(false);
  assertEquals(openExternal('https://app.shuftipro.com/v', { win: blocked.win }), 'same-tab');
  assertEquals(blocked.calls[1], 'assign:https://app.shuftipro.com/v');
});

Deno.test('openExternal: refuses non-https or malformed links', () => {
  const { win, calls } = fakeWindow(true);
  assertEquals(openExternal('javascript:alert(1)', { win }), 'invalid');
  assertEquals(openExternal('not a url', { win }), 'invalid');
  assertEquals(openExternal('http://insecure.example', { win }), 'invalid');
  assertEquals(calls.length, 0);
});
