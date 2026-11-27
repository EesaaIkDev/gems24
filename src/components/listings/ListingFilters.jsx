import React, { useState } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import BottomSheet from "@/components/ui/bottom-sheet";
import { SlidersHorizontal } from "lucide-react";
import { GlassSelect } from "@/components/liquid-glass/glass-select";
import { GEM_TYPES, TREATMENTS, cap } from "@/lib/gems";
import CountryFilter from "@/components/common/CountryFilter";
import { values } from "@/components/common/filterValues";
import { haptic } from "@/lib/despia";

const ALL = "all";

export default function ListingFilters({ filters, setFilters, countries }) {
  const [open, setOpen] = useState(false);
  const set = (k, v) => setFilters((f) => ({ ...f, [k]: v }));
  const choose = (k, v) => {
    haptic("light");
    set(k, v);
  };
  const secondaryCount = values(filters.treatment).length + values(filters.country).length + (filters.minCt || filters.maxCt ? 1 : 0);

  const clearAll = () => {
    haptic("heavy");
    setFilters({ q: filters.q, type: [], treatment: [], country: [], minCt: "", maxCt: "" });
  };

  // GlassSelect is single-value; the filters state stays an array for the query layer.
  const typeValue = filters.type.length === 1 ? filters.type[0] : ALL;
  const treatmentValue = filters.treatment.length === 1 ? filters.treatment[0] : ALL;

  return (
    <>
      {/* The primary choice stays one tap away; everything used less often is
          grouped behind Filters so the results start higher on the screen. */}
      <div className="flex gap-1.5 overflow-x-auto -mx-3.5 px-3.5 pb-1 scrollbar-none fade-x">
        <button
          type="button"
          onClick={() => {
            haptic("light");
            setOpen(true);
          }}
          className={`relative shrink-0 flex items-center gap-1.5 rounded-full border px-3.5 py-1.5 text-[13px] font-medium transition-colors before:absolute before:-inset-y-1 before:inset-x-0 before:content-[''] ${
            secondaryCount ? "border-primary bg-accent text-accent-foreground" : "border-border bg-background text-muted-foreground hover:bg-secondary"
          }`}
        >
          <SlidersHorizontal className="h-3.5 w-3.5" />
          Filters{secondaryCount ? ` · ${secondaryCount}` : ""}
        </button>
      </div>

      <GlassSelect
        label="Gem type"
        placeholder="All types"
        className="mt-2 !w-full"
        value={typeValue}
        onValueChange={(v) => choose("type", !v || v === ALL ? [] : [v])}
        options={[
          { value: ALL, label: "All types" },
          ...GEM_TYPES.map((t) => ({ value: t, label: cap(t) })),
        ]}
      />

      <BottomSheet
        open={open}
        onOpenChange={setOpen}
        title="Filter stones"
        description="Narrow the marketplace without losing your search."
      >
        <div className="space-y-5">
          <FilterSection label="Treatment">
            <GlassSelect
              label="Treatment"
              placeholder="Any treatment"
              className="!w-full"
              value={treatmentValue}
              onValueChange={(v) => choose("treatment", !v || v === ALL ? [] : [v])}
              options={[
                { value: ALL, label: "Any treatment" },
                ...TREATMENTS.map((t) => ({ value: t, label: cap(t) })),
              ]}
            />
          </FilterSection>

          <FilterSection label="Seller location">
            <CountryFilter countries={countries} selected={values(filters.country)} onChange={(v) => choose("country", v)} />
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
            <Button onClick={() => { haptic("heavy"); setOpen(false); }}>Show results</Button>
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
