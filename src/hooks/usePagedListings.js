import { useCallback, useEffect, useRef, useState } from "react";
import { base44 } from "@/api/base44Client";
import { getRows, putRow, removeRow } from "@/lib/localdb";
import { visible } from "@/lib/offlineSync";

export const LISTING_PAGE = 24;

/** Status filter for anything on the market (rows without a status count as available). */
export const ON_MARKET = { status: { $ne: "sold" } };

/**
 * Use { $in: [...] } for multi-value filters, never the bare-array shorthand:
 * on the live backend the shorthand drops results when combined with cursor
 * pages (and reports has_more: false).
 *
 * Evaluates the subset of the server query syntax used for listings against a
 * cached row, so the offline mirror shows the same slice the server would.
 */
function matchesQuery(row, query) {
  return Object.entries(query).every(([field, cond]) => {
    const v = row[field];
    if (Array.isArray(cond)) return cond.includes(v);
    if (cond && typeof cond === "object") {
      if ("$ne" in cond && v === cond.$ne) return false;
      if ("$in" in cond && !cond.$in.includes(v)) return false;
      if ("$nin" in cond && cond.$nin.includes(v)) return false;
      if ("$gte" in cond && !(v >= cond.$gte)) return false;
      if ("$lte" in cond && !(v <= cond.$lte)) return false;
      return true;
    }
    return v === cond;
  });
}

const sortRows = (rows, sort) => {
  const desc = sort.startsWith("-");
  const field = sort.replace(/^[-+]/, "");
  const val = (r) => (field.endsWith("_date") ? Date.parse(r[field] || 0) : Number(r[field] || 0));
  return [...rows].sort((a, b) => (desc ? val(b) - val(a) : val(a) - val(b)));
};

const dedupe = (rows) => [...new Map(rows.map((r) => [r.id, r])).values()];

const FALLBACK_SORT = "-created_date";

/**
 * First page of a query. If the server rejects the sort field (e.g. a new
 * sort key whose schema hasn't been deployed yet) it falls back to newest
 * first rather than showing an empty marketplace.
 */
async function firstPage(query, sort, limit) {
  try {
    return await base44.entities.Listing.filter(query, { sort, limit });
  } catch (e) {
    const status = e?.status || e?.response?.status;
    if (status !== 400 || sort === FALLBACK_SORT) throw e;
    return base44.entities.Listing.filter(query, { sort: FALLBACK_SORT, limit });
  }
}

/**
 * Listings filtered and sorted on the server, one cursor page at a time.
 * Local-first: matching rows from the IndexedDB mirror paint immediately and
 * stand in when offline; fresh pages are cached back without disturbing rows
 * from other queries.
 */
export default function usePagedListings({ query, sort = "-placement", pageSize = LISTING_PAGE, enabled = true }) {
  const key = JSON.stringify({ query, sort, pageSize });
  const [state, setState] = useState({ items: null, cursor: null, error: false });
  const [loadingMore, setLoadingMore] = useState(false);
  const request = useRef(0);

  const fromCache = useCallback(async () => {
    const { query: q, sort: s, pageSize: n } = JSON.parse(key);
    const rows = visible(await getRows("Listing")).filter((r) => !r._pending && matchesQuery(r, q));
    return sortRows(rows, s).slice(0, n);
  }, [key]);

  const refresh = useCallback(async () => {
    if (!enabled) return;
    const n = ++request.current;
    const { query: q, sort: s, pageSize: limit } = JSON.parse(key);
    try {
      const page = await firstPage(q, s, limit);
      if (n !== request.current) return;
      const items = page.items || [];
      setState({ items, cursor: page.has_more ? page.next_cursor : null, error: false });
      await Promise.all(items.map((r) => putRow("Listing", r)));
      if (!page.has_more) {
        // The server returned the whole slice — drop cached rows it no longer has.
        const ids = new Set(items.map((r) => r.id));
        const cached = visible(await getRows("Listing")).filter((r) => !r._pending && matchesQuery(r, q));
        await Promise.all(cached.filter((r) => !ids.has(r.id)).map((r) => removeRow("Listing", r.id)));
      }
    } catch {
      if (n !== request.current) return;
      const cached = await fromCache();
      setState((prev) => ({ items: prev.items ?? cached, cursor: null, error: !prev.items && !cached.length }));
    }
  }, [key, enabled, fromCache]);

  useEffect(() => {
    let alive = true;
    setState({ items: null, cursor: null, error: false });
    fromCache().then((rows) => {
      if (alive && rows.length) setState((prev) => (prev.items === null ? { ...prev, items: rows } : prev));
    });
    refresh();
    // Pull-to-refresh anywhere in the app refetches the first page.
    window.addEventListener("app:refresh", refresh);
    return () => {
      alive = false;
      window.removeEventListener("app:refresh", refresh);
    };
  }, [refresh, fromCache]);

  const loadMore = useCallback(async () => {
    if (!state.cursor || loadingMore) return;
    const n = request.current;
    const { query: q, pageSize: limit } = JSON.parse(key);
    setLoadingMore(true);
    try {
      const page = await base44.entities.Listing.filter(q, { cursor: state.cursor, limit });
      if (n !== request.current) return;
      const items = page.items || [];
      setState((prev) => ({
        ...prev,
        items: dedupe([...(prev.items || []), ...items]),
        cursor: page.has_more ? page.next_cursor : null,
      }));
      await Promise.all(items.map((r) => putRow("Listing", r)));
    } catch {
      /* keep what we have; the trigger can retry */
    } finally {
      setLoadingMore(false);
    }
  }, [state.cursor, loadingMore, key]);

  return {
    items: state.items,
    error: state.error,
    hasMore: !!state.cursor,
    loadingMore,
    loadMore,
    refresh,
  };
}
