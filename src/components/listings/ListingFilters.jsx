import React from "react";
import { Input } from "@/components/ui/input";
import { X } from "lucide-react";
import { GEM_TYPES, TREATMENTS, cap } from "@/lib/gems";
import { chipClass as chip } from "@/components/common/filterChip";

export default function ListingFilters({ filters, setFilters, countries }) {
  const set = (k, v) => setFilters({ ...filters, [k]: v });

  const hasFilters = filters.type || filters.treatment || filters.country || filters.minCt || filters.maxCt;

  return (
    <div className="space-y-3">
      <div className="flex gap-2 overflow-x-auto pb-2 -mx-3.5 px-3.5 scrollbar-none">
        <button className={chip(!filters.type)} onClick={() => set("type", "")}>All stones</button>
        {GEM_TYPES.map((t) => (
          <button key={t} className={chip(filters.type === t)} onClick={() => set("type", t)}>
            {cap(t)}
          </button>
        ))}
      </div>

      <div className="flex gap-2 overflow-x-auto pb-2 -mx-3.5 px-3.5 scrollbar-none">
        {TREATMENTS.map((t) => (
          <button
            key={t}
            className={chip(filters.treatment === t)}
            onClick={() => set("treatment", filters.treatment === t ? "" : t)}
          >
            {cap(t)}
          </button>
        ))}
        {countries.map((c) => (
          <button
            key={c}
            className={chip(filters.country === c)}
            onClick={() => set("country", filters.country === c ? "" : c)}
          >
            {c}
          </button>
        ))}
      </div>

      <div className="flex items-center gap-2">
        <Input
          type="number"
          value={filters.minCt}
          onChange={(e) => set("minCt", e.target.value)}
          placeholder="Min ct"
          className="h-10 rounded-xl bg-card"
        />
        <span className="text-muted-foreground text-sm">–</span>
        <Input
          type="number"
          value={filters.maxCt}
          onChange={(e) => set("maxCt", e.target.value)}
          placeholder="Max ct"
          className="h-10 rounded-xl bg-card"
        />
        {hasFilters && (
          <button
            onClick={() => setFilters({ q: filters.q, type: "", treatment: "", country: "", minCt: "", maxCt: "" })}
            className="gem-corners gem-btn gem-chip shrink-0 h-10 px-3 text-xs font-semibold text-muted-foreground flex items-center gap-1 bg-secondary"
          >
            <X className="w-3.5 h-3.5" /> Clear
          </button>
        )}
      </div>
    </div>
  );
}