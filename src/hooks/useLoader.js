import { useCallback, useEffect, useState } from "react";

/**
 * Runs an async loader and tracks loading / error / data so screens can never
 * hang on a spinner: a failed request surfaces a retry state instead.
 */
export default function useLoader(loader, deps = []) {
  const [data, setData] = useState(null);
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(true);

  // eslint-disable-next-line react-hooks/exhaustive-deps
  const run = useCallback(loader, deps);

  const reload = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      setData(await run());
    } catch (e) {
      setError(e);
    }
    setLoading(false);
  }, [run]);

  useEffect(() => {
    reload();
  }, [reload]);

  return { data, error, loading, reload };
}