/* Tiny IndexedDB layer: mirrored entity rows, a write outbox and small meta
   values (cached user). All calls resolve to safe empty values if IDB is
   unavailable, so nothing here can break a render. */

const DB_NAME = "gems24-offline";
const DB_VERSION = 1;
const RECORDS = "records";
const OUTBOX = "outbox";
const META = "meta";

let dbPromise = null;

function openDb() {
  if (dbPromise) return dbPromise;
  dbPromise = new Promise((resolve, reject) => {
    if (typeof indexedDB === "undefined") return reject(new Error("no idb"));
    const req = indexedDB.open(DB_NAME, DB_VERSION);
    req.onupgradeneeded = () => {
      const db = req.result;
      if (!db.objectStoreNames.contains(RECORDS)) {
        const store = db.createObjectStore(RECORDS, { keyPath: "key" });
        store.createIndex("entity", "entity");
      }
      if (!db.objectStoreNames.contains(OUTBOX)) {
        db.createObjectStore(OUTBOX, { keyPath: "jobId", autoIncrement: true });
      }
      if (!db.objectStoreNames.contains(META)) {
        db.createObjectStore(META, { keyPath: "key" });
      }
    };
    req.onsuccess = () => resolve(req.result);
    req.onerror = () => reject(req.error);
  }).catch((e) => {
    dbPromise = null;
    throw e;
  });
  return dbPromise;
}

function tx(store, mode, run) {
  return openDb().then(
    (db) =>
      new Promise((resolve, reject) => {
        const t = db.transaction(store, mode);
        const result = run(t.objectStore(store));
        t.oncomplete = () => resolve(result && result.value !== undefined ? result.value : result);
        t.onerror = () => reject(t.error);
        t.onabort = () => reject(t.error);
      })
  );
}

const wrap = (req) => {
  const box = { value: undefined };
  req.onsuccess = () => {
    box.value = req.result;
  };
  return box;
};

const key = (entity, id) => `${entity}:${id}`;

/* --- mirrored records ------------------------------------------------- */

export async function getRows(entity) {
  try {
    const rows = await tx(RECORDS, "readonly", (s) => wrap(s.index("entity").getAll(entity)));
    return (rows || []).map((r) => r.row);
  } catch {
    return [];
  }
}

export async function putRow(entity, row) {
  try {
    await tx(RECORDS, "readwrite", (s) => s.put({ key: key(entity, row.id), entity, row }));
  } catch {
    /* offline storage unavailable — ignore */
  }
}

export async function removeRow(entity, id) {
  try {
    await tx(RECORDS, "readwrite", (s) => s.delete(key(entity, id)));
  } catch {
    /* ignore */
  }
}

/** Merge a fresh server page into the mirror: newest updated_date wins, but a
 *  row with unsynced local changes always keeps its local version. */
export async function mergeRows(entity, serverRows) {
  const local = await getRows(entity);
  const byId = Object.fromEntries(local.map((r) => [r.id, r]));
  const merged = [];
  for (const remote of serverRows) {
    const mine = byId[remote.id];
    if (mine?._pending) {
      merged.push(mine);
      continue;
    }
    if (mine?._deleted) continue;
    const newer =
      mine && new Date(mine.updated_date || 0) > new Date(remote.updated_date || 0) ? mine : remote;
    merged.push(newer);
    await putRow(entity, newer);
  }
  const serverIds = new Set(serverRows.map((r) => r.id));
  for (const mine of local) {
    if (serverIds.has(mine.id)) continue;
    if (mine._deleted) continue;
    // Keep local-only rows (created offline); drop rows the server no longer has.
    if (mine._pending) merged.push(mine);
    else await removeRow(entity, mine.id);
  }
  return merged;
}

/* --- outbox ----------------------------------------------------------- */

export async function addJob(job) {
  try {
    await tx(OUTBOX, "readwrite", (s) => s.add({ ...job, at: Date.now() }));
  } catch {
    /* ignore */
  }
}

export async function getJobs() {
  try {
    return (await tx(OUTBOX, "readonly", (s) => wrap(s.getAll()))) || [];
  } catch {
    return [];
  }
}

export async function removeJob(jobId) {
  try {
    await tx(OUTBOX, "readwrite", (s) => s.delete(jobId));
  } catch {
    /* ignore */
  }
}

/* --- meta ------------------------------------------------------------- */

export async function setMeta(k, value) {
  try {
    await tx(META, "readwrite", (s) => s.put({ key: k, value }));
  } catch {
    /* ignore */
  }
}

export async function getMeta(k) {
  try {
    const row = await tx(META, "readonly", (s) => wrap(s.get(k)));
    return row ? row.value : null;
  } catch {
    return null;
  }
}