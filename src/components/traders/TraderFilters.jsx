import React from "react";
import { GEM_TYPES, TIER_ORDER, TIERS, cap } from "@/lib/gems";
import { chipClass as chip } from "@/components/common/filterChip";

export default function TraderFilters({ filters, setFilters, countries }) {
  const set = (k, v) => setFilters((f) => ({ ...f, [k]: f[k] === v ? "" : v }));

  return (
    <div className="space-y-2">
      <div className="flex gap-2 overflow-x-auto -mx-3.5 px-3.5 pb-2 scrollbar-none">
        <button className={chip(!filters.specialty)} onClick={() => setFilters((f) => ({ ...f, specialty: "" }))}>
          All specialties
        </button>
        {GEM_TYPES.map((g) => (
          <button key={g} className={chip(filters.specialty === g)} onClick={() => set("specialty", g)}>
            {cap(g)}
          </button>
        ))}
      </div>
      <div className="flex gap-2 overflow-x-auto -mx-3.5 px-3.5 pb-2 scrollbar-none">
        {TIER_ORDER.map((t) => (
          <button key={t} className={chip(filters.tier === t)} onClick={() => set("tier", t)}>
            {TIERS[t].label}
          </button>
        ))}
        {countries.map((c) => (
          <button key={c} className={chip(filters.country === c)} onClick={() => set("country", c)}>
            {c}
          </button>
        ))}
      </div>
    </div>
  );
}