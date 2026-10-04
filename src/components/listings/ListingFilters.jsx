import React, { useState } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import BottomSheet from "@/components/ui/bottom-sheet";
import { SlidersHorizontal } from "lucide-react";
import { GEM_TYPES, TREATMENTS, cap } from "@/lib/gems";
import { chipClass as chip } from "@/components/common/filterChip";
import CountryFilter from "@/components/common/CountryFilter";
import { values, selected, toggle } from "@/components/common/filterValues";

export default function ListingFilters({ filters, setFilters, countries }) {
  const [open, setOpen] = useState(false);
  const set = (k, v) => setFilters((f) => ({ ...f, [k]: v }));
  const pick = (k, v) => setFilters((f) => ({ ...f, [k]: toggle(f[k], v) }));
  const secondaryCount = values(filters.treatment).length + values(filters.country).length + (filters.minCt || filters.maxCt ? 1 : 0);

  const clearAll = () =>
    setFilters({ q: filters.q, type: [], treatment: [], country: [], minCt: "", maxCt: "" });

  return (
    <>
      {/* The primary choice stays one tap away; everything used less often is
          grouped behind Filters so the results start higher on the screen. */}
      <div className="flex gap-1.5 overflow-x-auto -mx-3.5 px-3.5 pb-1 scrollbar-none">
        <button
          type="button"
          onClick={() => setOpen(true)}
          className={`gem-chip shrink-0 flex items-center gap-1.5 px-3 py-1 text-[0.6875rem] font-semibold ${
            secondaryCount ? "neu-inset text-primary" : "neu-raised-xs text-muted-foreground"
          }`}
        >
          <SlidersHorizontal className="h-3.5 w-3.5" />
          Filters{secondaryCount ? ` · ${secondaryCount}` : ""}
        </button>
        <button aria-pressed={!values(filters.type).length} className={chip(!values(filters.type).length)} onClick={() => set("type", [])}>All</button>
        {GEM_TYPES.map((t) => (
          <button key={t} aria-pressed={selected(filters.type, t)} className={chip(selected(filters.type, t))} onClick={() => pick("type", t)}>
            {cap(t)}
          </button>
        ))}
      </div>

      <BottomSheet
        open={open}
        onOpenChange={setOpen}
        title="Filter stones"
        description="Narrow the marketplace without losing your search."
      >
        <div className="space-y-5">
          <FilterSection label="Treatment">
            <div className="flex flex-wrap gap-2">
              {TREATMENTS.map((t) => (
                <button
                  key={t}
                  className={chip(selected(filters.treatment, t))}
                  aria-pressed={selected(filters.treatment, t)}
                  onClick={() => pick("treatment", t)}
                >
                  {cap(t)}
                </button>
              ))}
            </div>
          </FilterSection>

          <FilterSection label="Seller location">
            <CountryFilter countries={countries} selected={values(filters.country)} onChange={(v) => set("country", v)} />
          </FilterSection>

          <FilterSection label="Carat weight">
            <div className="grid grid-cols-[1fr_auto_1fr] items-center gap-2">
              <Input
                type="number"
                min="0"
                inputMode="decimal"
                value={filters.minCt}
                onChange={(e) => set("minCt", e.target.value)}
                placeholder="Minimum"
                className="h-11 rounded-xl bg-background"
              />
              <span className="text-xs text-muted-foreground">to</span>
              <Input
                type="number"
                min="0"
                inputMode="decimal"
                value={filters.maxCt}
                onChange={(e) => set("maxCt", e.target.value)}
                placeholder="Maximum"
                className="h-11 rounded-xl bg-background"
              />
            </div>
          </FilterSection>

          <div className="grid grid-cols-2 gap-2 pt-1">
            <Button variant="outline" onClick={clearAll}>Clear all</Button>
            <Button onClick={() => setOpen(false)}>Show results</Button>
          </div>
        </div>
      </BottomSheet>
    </>
  );
}

function FilterSection({ label, children }) {
  return (
    <section>
      <p className="mb-2 text-[0.6875rem] font-semibold uppercase tracking-wider text-muted-foreground">{label}</p>
      {children}
    </section>
  );
}