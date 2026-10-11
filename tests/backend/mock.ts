/**
 * In-memory stand-in for the Base44 SDK, mapped over npm:@base44/sdk by
 * tests/backend/deno.json. Tests seed `db`, set the session user, then call the
 * real function handlers.
 */
type Row = Record<string, any>;

export const db: Record<string, Row[]> = {};
export const state: {
  user: Row | null;
  pushes: Row[];
  shufti: { requests: Row[]; respond: (path: string, body: Row) => Row; badSignature?: boolean };
} = { user: null, pushes: [], shufti: { requests: [], respond: () => ({}) } };

export const SHUFTI_SECRET = 'shufti-test-secret';
const sha256 = async (s: string) =>
  Array.from(new Uint8Array(await crypto.subtle.digest('SHA-256', new TextEncoder().encode(s))))
    .map((b) => b.toString(16).padStart(2, '0')).join('');
/** Signs a body the way Shufti does: sha256(body + sha256(secret)). */
export const shuftiSign = async (raw: string, key = SHUFTI_SECRET) => sha256(raw + (await sha256(key)));

let seq = 0;
const now = () => new Date().toISOString();
const matches = (row: Row, q: Row = {}) => Object.entries(q).every(([k, v]) => row[k] === v);

function entity(name: string) {
  const rows = () => (db[name] ??= []);
  return {
    async filter(q: Row = {}, sort?: string, limit?: number) {
      const found = rows().filter((r) => matches(r, q)).map((r) => ({ ...r }));
      if (sort?.startsWith('-')) found.sort((a, b) => String(b[sort.slice(1)] || '').localeCompare(String(a[sort.slice(1)] || '')));
      return limit ? found.slice(0, limit) : found;
    },
    async list(_sort?: string, limit = 1000, skip = 0) {
      return rows().slice(skip, skip + limit).map((r) => ({ ...r }));
    },
    async get(id: string) {
      const r = rows().find((x) => x.id === id);
      if (!r) throw Object.assign(new Error('Not found'), { status: 404 });
      return { ...r };
    },
    async create(data: Row) {
      const r = { id: `${name}-${++seq}`, created_date: now(), created_by_id: state.user?.id ?? 'service', ...data };
      rows().push(r);
      return { ...r };
    },
    async update(id: string, patch: Row) {
      const r = rows().find((x) => x.id === id);
      if (!r) throw Object.assign(new Error('Not found'), { status: 404 });
      Object.assign(r, patch);
      return { ...r };
    },
    async delete(id: string) {
      const i = rows().findIndex((x) => x.id === id);
      if (i >= 0) rows().splice(i, 1);
    },
  };
}

const entities: any = new Proxy({}, { get: (_t, name: string) => entity(name) });

export function createClientFromRequest(_req: Request): any {
  return {
    auth: {
      async me() {
        if (!state.user) throw Object.assign(new Error('Unauthorized'), { status: 401 });
        return state.user;
      },
    },
    entities,
    asServiceRole: { entities },
  };
}

export function reset() {
  for (const k of Object.keys(db)) delete db[k];
  state.user = null;
  state.pushes = [];
  state.shufti = { requests: [], respond: () => ({}) };
}

export const SECRETS: Record<string, string> = {
  SHUFTI_CLIENT_ID: 'shufti-client',
  SHUFTI_SECRET_KEY: SHUFTI_SECRET,
};
export const secrets = { get: (k: string) => (k in SECRETS ? SECRETS[k] : 'test-key') };

// Shufti and OneSignal are reached through fetch — answer/record instead of calling out.
globalThis.fetch = (async (url: string, init: RequestInit) => {
  const body = JSON.parse(String(init.body));
  if (String(url).startsWith('https://api.shuftipro.com')) {
    const path = new URL(String(url)).pathname;
    state.shufti.requests.push({ path, body, auth: (init.headers as Row)?.Authorization });
    const raw = JSON.stringify(state.shufti.respond(path, body));
    const signature = state.shufti.badSignature ? 'forged' : await shuftiSign(raw);
    return new Response(raw, { headers: { signature } });
  }
  state.pushes.push(body);
  return new Response(JSON.stringify({ id: 'push' }));
}) as typeof fetch;
