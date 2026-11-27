import React, { useState } from "react";
import BottomSheet from "@/components/ui/bottom-sheet";
import { SlidersHorizontal } from "lucide-react";
import { GEM_TYPES, TIER_ORDER, TIERS, cap } from "@/lib/gems";
import { chipClass as chip } from "@/components/common/filterChip";
import CountryFilter from "@/components/common/CountryFilter";
import { values, selected, toggle } from "@/components/common/filterValues";
import { haptic } from "@/lib/despia";
import { GlassButtonGroup, GlassButtonGroupItem } from "@/components/liquid-glass";

export default function TraderFilters({ filters, setFilters, countries, specialties = GEM_TYPES }) {
  const [open, setOpen] = useState(false);
  // Every control here is a toggle, so each change ticks.
  const update = (fn) => {
    haptic("light");
    setFilters(fn);
  };
  const set = (k, v) => update((f) => ({ ...f, [k]: toggle(f[k], v) }));
  const secondaryCount = values(filters.tier).length + values(filters.country).length;

  const clearAll = () => {
    haptic("heavy");
    update(() => ({ specialty: [], tier: [], country: [] }));
  };

  return (
    <>
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
        <button aria-pressed={!values(filters.specialty).length} className={chip(!values(filters.specialty).length)} onClick={() => update((f) => ({ ...f, specialty: [] }))}>
          All
        </button>
        {specialties.map((g) => (
          <button key={g} aria-pressed={selected(filters.specialty, g)} className={chip(selected(filters.specialty, g))} onClick={() => set("specialty", g)}>
            {cap(g)}
          </button>
        ))}
      </div>

      <BottomSheet
        open={open}
        onOpenChange={setOpen}
        title="Filter traders"
        description="Choose a membership grade or location."
        footer={
          <GlassButtonGroup aria-label="Filter actions">
            <GlassButtonGroupItem
              onClick={clearAll}
              className="text-sm font-medium"
            >
              Clear all
            </GlassButtonGroupItem>
            <GlassButtonGroupItem
              onClick={() => { haptic("heavy"); setOpen(false); }}
              className="text-sm font-medium"
            >
              Show results
            </GlassButtonGroupItem>
          </GlassButtonGroup>
        }
      >
        <div className="space-y-5 pb-4">
          <FilterSection label="Membership grade">
            <div className="flex flex-wrap gap-2">
              {[...TIER_ORDER, "none"].map((t) => (
                <button key={t} aria-pressed={selected(filters.tier, t)} className={chip(selected(filters.tier, t))} onClick={() => set("tier", t)}>
                  {TIERS[t].label}
                </button>
              ))}
            </div>
          </FilterSection>

          <FilterSection label="Location">
            <CountryFilter countries={countries} selected={values(filters.country)} onChange={(v) => update((f) => ({ ...f, country: v }))} />
          </FilterSection>
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