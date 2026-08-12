import { useCallback, useEffect, useState } from "react";
import { getRows, mergeRows } from "@/lib/localdb";
import { visible } from "@/lib/offlineSync";

/**
 * Local-first entity read: renders the IndexedDB mirror right away (never
 * awaiting the network), then refreshes from Base44 in the background and
 * merges the result back into the mirror.
 */
export default function useOfflineEntity(entity, fetcher, deps = []) {
  const [rows, setRows] = useState(null);
  const [syncing, setSyncing] = useState(true);
  const [stale, setStale] = useState(false);

  // eslint-disable-next-line react-hooks/exhaustive-deps
  const fetch = useCallback(fetcher, deps);

  const refresh = useCallback(async () => {
    setSyncing(true);
    try {
      const fresh = await fetch();
      setRows(visible(await mergeRows(entity, fresh || [])));
      setStale(false);
    } catch {
      setStale(true);
    }
    setSyncing(false);
  }, [entity, fetch]);

  useEffect(() => {
    let alive = true;
    getRows(entity).then((local) => {
      if (alive && local.length) setRows(visible(local));
    });
    refresh();
    return () => {
      alive = false;
    };
  }, [entity, refresh]);

  return { rows, syncing, stale, refresh };
}