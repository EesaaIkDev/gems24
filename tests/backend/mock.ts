/**
 * In-memory stand-in for the Base44 SDK, mapped over npm:@base44/sdk by
 * tests/backend/deno.json. Tests seed `db`, set the session user, then call the
 * real function handlers.
 */
type Row = Record<string, any>;

export const db: Record<string, Row[]> = {};
export const state: { user: Row | null; pushes: Row[] } = { user: null, pushes: [] };

let seq = 0;
const now = () => new Date().toISOString();
const matches = (row: Row, q: Row = {}) => Object.entries(q).every(([k, v]) => row[k] === v);

function entity(name: string) {
  const rows = () => (db[name] ??= []);
  return {
    async filter(q: Row = {}) {
      return rows().filter((r) => matches(r, q)).map((r) => ({ ...r }));
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
}

export const secrets = { get: (_k: string) => 'test-key' };

// OneSignal is reached through fetch — record instead of calling out.
globalThis.fetch = (async (_url: string, init: RequestInit) => {
  state.pushes.push(JSON.parse(String(init.body)));
  return new Response(JSON.stringify({ id: 'push' }));
}) as typeof fetch;
