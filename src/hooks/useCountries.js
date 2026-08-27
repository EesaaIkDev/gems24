import { useEffect, useState } from "react";
import { fallbackCountries } from "@/lib/countryData";

/**
 * Country names + international dial codes. Tries the public REST Countries
 * API, and falls back to the bundled list when the network call fails
 * (offline, blocked request, API downtime) so the form always works.
 */
const CACHE_KEY = "gems24_countries";
const URL = "https://restcountries.com/v3.1/all?fields=name,cca2,idd";

export default function useCountries() {
  const [countries, setCountries] = useState(() => {
    const raw = sessionStorage.getItem(CACHE_KEY);
    return raw ? JSON.parse(raw) : fallbackCountries();
  });
  const [loading, setLoading] = useState(!sessionStorage.getItem(CACHE_KEY));

  useEffect(() => {
    if (sessionStorage.getItem(CACHE_KEY)) return;
    let alive = true;
    (async () => {
      try {
        const res = await fetch(URL);
        if (!res.ok) throw new Error("bad response");
        const data = await res.json();
        const list = data
          .map((c) => {
            const root = c.idd?.root || "";
            const suffix = c.idd?.suffixes?.length === 1 ? c.idd.suffixes[0] : "";
            return { name: c.name?.common, code: c.cca2, dial: root ? `${root}${suffix}` : "" };
          })
          .filter((c) => c.name)
          .sort((a, b) => a.name.localeCompare(b.name));
        if (!alive || !list.length) return;
        sessionStorage.setItem(CACHE_KEY, JSON.stringify(list));
        setCountries(list);
      } catch {
        // Keep the bundled fallback already in state.
      } finally {
        if (alive) setLoading(false);
      }
    })();
    return () => {
      alive = false;
    };
  }, []);

  return { countries, loading };
}