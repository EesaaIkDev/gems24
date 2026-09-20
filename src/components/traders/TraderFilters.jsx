import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import BottomSheet from "@/components/ui/bottom-sheet";
import { SlidersHorizontal } from "lucide-react";
import { GEM_TYPES, TIER_ORDER, TIERS, cap } from "@/lib/gems";
import { chipClass as chip } from "@/components/common/filterChip";

export default function TraderFilters({ filters, setFilters, countries }) {
  const [open, setOpen] = useState(false);
  const set = (k, v) => setFilters((f) => ({ ...f, [k]: f[k] === v ? "" : v }));
  const secondaryCount = [filters.tier, filters.country].filter(Boolean).length;

  const clearAll = () => setFilters({ specialty: "", tier: "", country: "" });

  return (
    <>
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
        <button className={chip(!filters.specialty)} onClick={() => setFilters((f) => ({ ...f, specialty: "" }))}>
          All
        </button>
        {GEM_TYPES.map((g) => (
          <button key={g} className={chip(filters.specialty === g)} onClick={() => set("specialty", g)}>
            {cap(g)}
          </button>
        ))}
      </div>

      <BottomSheet
        open={open}
        onOpenChange={setOpen}
        title="Filter traders"
        description="Choose a membership grade or location."
      >
        <div className="space-y-5">
          <FilterSection label="Membership grade">
            <div className="flex flex-wrap gap-2">
              {TIER_ORDER.map((t) => (
                <button key={t} className={chip(filters.tier === t)} onClick={() => set("tier", t)}>
                  {TIERS[t].label}
                </button>
              ))}
            </div>
          </FilterSection>

          {countries.length > 0 && (
            <FilterSection label="Location">
              <div className="flex flex-wrap gap-2">
                {countries.map((c) => (
                  <button key={c} className={chip(filters.country === c)} onClick={() => set("country", c)}>
                    {c}
                  </button>
                ))}
              </div>
            </FilterSection>
          )}

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
