import { assertEquals } from 'jsr:@std/assert@1';
import { isShuftiUrl, openExternal, openInSecureBrowser } from '../../src/lib/openExternal.js';

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

Deno.test('isShuftiUrl: only https Shufti hosts', () => {
  assertEquals(isShuftiUrl('https://app.shuftipro.com/verification/abc'), true);
  assertEquals(isShuftiUrl('https://shuftipro.com/x'), true);
  assertEquals(isShuftiUrl('http://app.shuftipro.com/x'), false);
  assertEquals(isShuftiUrl('https://shuftipro.com.evil.example/x'), false);
  assertEquals(isShuftiUrl('https://evilshuftipro.com/x'), false);
  assertEquals(isShuftiUrl(''), false);
});

Deno.test('openInSecureBrowser: sends Despia oauth:// for Shufti links only', () => {
  const sent: string[] = [];
  assertEquals(openInSecureBrowser('https://app.shuftipro.com/v?a=1&b=2', (c: string) => sent.push(c)), true);
  assertEquals(sent, ['oauth://?url=https%3A%2F%2Fapp.shuftipro.com%2Fv%3Fa%3D1%26b%3D2']);
  assertEquals(openInSecureBrowser('https://evil.example', (c: string) => sent.push(c)), false);
  assertEquals(sent.length, 1);
});
