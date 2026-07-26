import { useEffect, useState, useCallback } from "react";
import { base44 } from "@/api/base44Client";

export default function useCurrentTrader() {
  const [user, setUser] = useState(null);
  const [trader, setTrader] = useState(null);
  const [loading, setLoading] = useState(true);

  const load = useCallback(async () => {
    setLoading(true);
    let me = null;
    try {
      me = await base44.auth.me();
    } catch {
      me = null;
    }
    setUser(me);
    if (me) {
      const rows = await base44.entities.Trader.filter({ user_email: me.email });
      setTrader(rows[0] || null);
    } else {
      setTrader(null);
    }
    setLoading(false);
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  return { user, trader, loading, reload: load };
}