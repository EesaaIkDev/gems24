import { useEffect, useState } from "react";

/**
 * Country names + international dial codes, fetched from the public
 * REST Countries API and cached in sessionStorage for the session.
 */
const CACHE_KEY = "gems24_countries";
const URL = "https://restcountries.com/v3.1/all?fields=name,cca2,idd";

export default function useCountries() {
  const [countries, setCountries] = useState(() => {
    const raw = sessionStorage.getItem(CACHE_KEY);
    return raw ? JSON.parse(raw) : [];
  });
  const [loading, setLoading] = useState(countries.length === 0);

  useEffect(() => {
    if (countries.length) return;
    let alive = true;
    (async () => {
      const res = await fetch(URL);
      const data = await res.json();
      const list = data
        .map((c) => {
          const root = c.idd?.root || "";
          const suffix = c.idd?.suffixes?.length === 1 ? c.idd.suffixes[0] : "";
          return { name: c.name?.common, code: c.cca2, dial: root ? `${root}${suffix}` : "" };
        })
        .filter((c) => c.name)
        .sort((a, b) => a.name.localeCompare(b.name));
      if (!alive) return;
      sessionStorage.setItem(CACHE_KEY, JSON.stringify(list));
      setCountries(list);
      setLoading(false);
    })();
    return () => {
      alive = false;
    };
  }, [countries.length]);

  return { countries, loading };
}