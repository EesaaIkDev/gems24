/* Optimistic writes + outbox replay.
   Every write lands in IndexedDB immediately with a _pending flag and a queued
   job; the queue is flushed when the app is online, on 'online' and on
   visibilitychange. */

import { base44 } from "@/api/base44Client";
import { addJob, getJobs, putRow, removeJob, removeRow, getRows } from "@/lib/localdb";

const listeners = new Set();
let pending = 0;
let flushing = false;

export function subscribePending(fn) {
  listeners.add(fn);
  fn(pending);
  return () => listeners.delete(fn);
}

async function refreshPending() {
  pending = (await getJobs()).length;
  listeners.forEach((fn) => fn(pending));
}

/** Local-only bookkeeping fields never go to the server. */
export function strip(row) {
  const { _pending, _deleted, _localId, ...clean } = row || {};
  return clean;
}

/** Rows safe to render: tombstones hidden. */
export const visible = (rows) => (rows || []).filter((r) => !r._deleted);

const tempId = () => `local-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;

export async function createRecord(entity, data) {
  const localId = tempId();
  const row = { ...data, id: localId, _localId: localId, _pending: true, updated_date: new Date().toISOString() };
  await putRow(entity, row);
  await addJob({ op: "create", entity, localId, data: strip(data) });
  await refreshPending();
  flushOutbox();
  return row;
}

export async function updateRecord(entity, id, patch) {
  const rows = await getRows(entity);
  const prev = rows.find((r) => r.id === id) || null;
  const row = { ...(prev || { id }), ...patch, _pending: true, updated_date: new Date().toISOString() };
  await putRow(entity, row);
  await addJob({ op: "update", entity, id, data: strip(patch), prev: prev ? strip(prev) : null });
  await refreshPending();
  flushOutbox();
  return row;
}

export async function deleteRecord(entity, id) {
  const rows = await getRows(entity);
  const prev = rows.find((r) => r.id === id) || null;
  await putRow(entity, { ...(prev || { id }), id, _deleted: true, _pending: true });
  await addJob({ op: "delete", entity, id, prev: prev ? strip(prev) : null });
  await refreshPending();
  flushOutbox();
}

const isClientError = (e) => {
  const status = e?.status || e?.response?.status || e?.statusCode;
  return typeof status === "number" && status >= 400 && status < 500;
};

async function revert(job) {
  if (job.op === "create") await removeRow(job.entity, job.localId);
  else if (job.prev) await putRow(job.entity, job.prev);
  else await removeRow(job.entity, job.id);
}

let onError = null;
/** UI can register a single handler to surface dropped writes. */
export function setSyncErrorHandler(fn) {
  onError = fn;
}

export async function flushOutbox() {
  if (flushing || navigator.onLine === false) return;
  flushing = true;
  try {
    const jobs = await getJobs();
    for (const job of jobs) {
      const api = base44.entities[job.entity];
      if (!api) {
        await removeJob(job.jobId);
        continue;
      }
      try {
        if (job.op === "create") {
          const saved = await api.create(job.data);
          // Temp row goes away so the record can never show up twice.
          await removeRow(job.entity, job.localId);
          if (saved?.id) await putRow(job.entity, saved);
        } else if (job.op === "update") {
          const saved = await api.update(job.id, job.data);
          if (saved?.id) await putRow(job.entity, saved);
          else await putRow(job.entity, { ...job.prev, ...job.data, id: job.id });
        } else if (job.op === "delete") {
          await api.delete(job.id);
          await putRow(job.entity, { id: job.id, _deleted: true });
        }
        await removeJob(job.jobId);
      } catch (e) {
        if (isClientError(e)) {
          // Permissions / schema failures never succeed on retry.
          await removeJob(job.jobId);
          await revert(job);
          onError?.(e, job);
          continue;
        }
        break; // network or server issue — keep the queue intact
      }
    }
  } finally {
    flushing = false;
    await refreshPending();
  }
}

export function startOutboxSync() {
  refreshPending();
  flushOutbox();
  window.addEventListener("online", flushOutbox);
  document.addEventListener("visibilitychange", () => {
    if (document.visibilityState === "visible") flushOutbox();
  });
}