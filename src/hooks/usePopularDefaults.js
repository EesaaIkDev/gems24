import { useEffect, useState } from "react";
import { base44 } from "@/api/base44Client";
import { GEM_TYPES, TREATMENTS } from "@/lib/gems";

const mode = (rows, key, fallback) => {
  const counts = {};
  rows.forEach((r) => {
    if (r[key]) counts[r[key]] = (counts[r[key]] || 0) + 1;
  });
  const top = Object.entries(counts).sort((a, b) => b[1] - a[1])[0];
  return top ? top[0] : fallback;
};

/**
 * The most commonly listed gemstone type and treatment across the market —
 * used to pre-select form and filter values so nothing ever starts blank.
 */
export default function usePopularDefaults() {
  const [defaults, setDefaults] = useState(null);

  useEffect(() => {
    base44.entities.Listing.list("-created_date", 200)
      .then((rows) =>
        setDefaults({
          gemstone_type: mode(rows, "gemstone_type", GEM_TYPES[0]),
          treatment: mode(rows, "treatment", TREATMENTS[0]),
        })
      )
      .catch(() => setDefaults({ gemstone_type: GEM_TYPES[0], treatment: TREATMENTS[0] }));
  }, []);

  return defaults;
}