import { useEffect, useState } from "react";
import { base44 } from "@/api/base44Client";
import { GEM_TYPES, TREATMENTS } from "@/lib/gems";
import { ON_MARKET } from "@/hooks/usePagedListings";

const FALLBACK = { gemstone_type: GEM_TYPES[0], treatment: TREATMENTS[0] };

/** The most common value of a field among listings on the market, counted on the server. */
async function topValue(field, fallback) {
  const { rows } = await base44.entities.Listing.aggregate({
    query: { ...ON_MARKET, [field]: { $ne: null } },
    groupBy: field,
    sort: "-count",
    limit: 1,
  });
  return rows?.[0]?.[field] || fallback;
}

// One lookup per session — the market's most common stone barely moves minute to minute.
let cached = null;

/**
 * The most commonly listed gemstone type and treatment across the market —
 * used to pre-select form and filter values so nothing ever starts blank.
 */
export default function usePopularDefaults() {
  const [defaults, setDefaults] = useState(null);

  useEffect(() => {
    let alive = true;
    cached ??= Promise.all([
      topValue("gemstone_type", FALLBACK.gemstone_type),
      topValue("treatment", FALLBACK.treatment),
    ])
      .then(([gemstone_type, treatment]) => ({ gemstone_type, treatment }))
      .catch(() => {
        cached = null;
        return FALLBACK;
      });
    cached.then((d) => alive && setDefaults(d));
    return () => {
      alive = false;
    };
  }, []);

  return defaults;
}
