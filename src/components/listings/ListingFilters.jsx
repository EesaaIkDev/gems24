import React from "react";
import { Input } from "@/components/ui/input";
import { Search, X } from "lucide-react";
import { GEM_TYPES, TREATMENTS, cap } from "@/lib/gems";

export default function ListingFilters({ filters, setFilters, countries }) {
  const set = (k, v) => setFilters({ ...filters, [k]: v });
  const chip = (active) =>
    `shrink-0 rounded-full border px-3.5 py-1.5 text-xs font-medium transition-colors ${
      active ? "bg-primary text-primary-foreground border-primary" : "bg-card border-border text-muted-foreground hover:border-primary/40"
    }`;

  const hasFilters = filters.type || filters.treatment || filters.country || filters.minCt || filters.maxCt;

  return (
    <div className="space-y-3">
      <div className="relative">
        <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
        <Input
          value={filters.q}
          onChange={(e) => set("q", e.target.value)}
          placeholder="Search gemstones, colour, origin…"
          className="pl-10 h-12 rounded-xl bg-card"
        />
      </div>

      <div className="flex gap-2 overflow-x-auto pb-1 -mx-4 px-4 scrollbar-none">
        <button className={chip(!filters.type)} onClick={() => set("type", "")}>All stones</button>
        {GEM_TYPES.map((t) => (
          <button key={t} className={chip(filters.type === t)} onClick={() => set("type", t)}>
            {cap(t)}
          </button>
        ))}
      </div>

      <div className="flex gap-2 overflow-x-auto pb-1 -mx-4 px-4 scrollbar-none">
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
            className="shrink-0 h-10 px-3 rounded-xl border border-border text-xs text-muted-foreground flex items-center gap-1"
          >
            <X className="w-3.5 h-3.5" /> Clear
          </button>
        )}
      </div>
    </div>
  );
}