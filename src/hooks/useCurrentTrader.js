import { useEffect, useState, useCallback } from "react";
import { base44 } from "@/api/base44Client";
import { getMeta, setMeta, getRows, putRow } from "@/lib/localdb";

/**
 * Offline-first identity: renders from the locally cached user / trader row
 * immediately, then revalidates against Base44 in the background.
 */
export default function useCurrentTrader() {
  const [user, setUser] = useState(null);
  const [trader, setTrader] = useState(null);
  const [loading, setLoading] = useState(true);

  const load = useCallback(async () => {
    let me = null;
    try {
      me = await base44.auth.me();
    } catch {
      me = null;
    }
    if (!me) {
      // Offline (or logged out): a cached user is a rendering hint only.
      if (navigator.onLine === false) {
        setLoading(false);
        return;
      }
      setUser(null);
      setTrader(null);
      setLoading(false);
      return;
    }
    setUser(me);
    setMeta("user", me);
    try {
      const rows = await base44.entities.Trader.filter({ user_email: me.email });
      const mine = rows[0] || null;
      setTrader(mine);
      if (mine) putRow("Trader", mine);
    } catch {
      /* keep whatever the cache gave us */
    }
    setLoading(false);
  }, []);

  useEffect(() => {
    let alive = true;
    // Paint from cache first — never block the first render on the network.
    getMeta("user").then(async (cached) => {
      if (!alive || !cached) return;
      setUser((u) => u || cached);
      const rows = await getRows("Trader");
      const mine = rows.find((r) => r.user_email === cached.email && !r._deleted);
      if (alive && mine) {
        setTrader((t) => t || mine);
        setLoading(false);
      }
    });
    load();
    window.addEventListener("app:refresh", load);
    return () => {
      alive = false;
      window.removeEventListener("app:refresh", load);
    };
  }, [load]);

  return { user, trader, loading, reload: load };
}