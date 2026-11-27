import React, { useState } from "react";
import { Input } from "@/components/ui/input";
import { Check, ChevronRight } from "lucide-react";
import BottomSheet from "@/components/ui/bottom-sheet";

export default function CountryFilter({ countries, selected = [], onChange }) {
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState("");
  const choices = countries.filter((c) => c.toLowerCase().includes(query.trim().toLowerCase()));

  return (
    <>
      <button
        type="button"
        onClick={() => setOpen(true)}
        className="flex items-center justify-between w-full min-h-11 px-3 py-2 text-left border border-border rounded-xl bg-background hover:bg-secondary transition-colors"
      >
        <span className="text-sm">{selected.length ? `${selected.length} selected` : "All countries"}</span>
        <ChevronRight className="h-4 w-4 text-muted-foreground" />
      </button>

      <BottomSheet
        open={open}
        onOpenChange={setOpen}
        title="Seller location"
        description="Select countries to filter by"
        footer={
          <div className="grid grid-cols-2 gap-2">
            <button
              type="button"
              onClick={() => onChange([])}
              className="px-4 py-2.5 text-sm font-medium rounded-xl border border-border bg-background hover:bg-secondary transition-colors"
            >
              Clear
            </button>
            <button
              type="button"
              onClick={() => setOpen(false)}
              className="px-4 py-2.5 text-sm font-medium rounded-xl bg-primary text-primary-foreground hover:bg-primary/90 transition-colors"
            >
              Done
            </button>
          </div>
        }
      >
        <div className="space-y-4 pb-4">
          <Input
            aria-label="Search countries"
            placeholder="Search countries…"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            className="h-11 text-base"
          />
          <div className="space-y-1">
            <button
              type="button"
              onClick={() => onChange([])}
              className="flex w-full min-h-11 items-center justify-between gap-3 px-3 py-2 text-left text-sm rounded-lg hover:bg-secondary transition-colors"
            >
              <span>All countries</span>
              {!selected.length && <Check className="h-4 w-4 shrink-0 text-primary" />}
            </button>
            {choices.map((country) => (
              <button
                type="button"
                key={country}
                onClick={() => onChange(selected.includes(country) ? selected.filter((c) => c !== country) : [...selected, country])}
                className="flex w-full min-h-11 items-center justify-between gap-3 px-3 py-2 text-left text-sm rounded-lg hover:bg-secondary transition-colors"
              >
                <span>{country}</span>
                {selected.includes(country) && <Check className="h-4 w-4 shrink-0 text-primary" />}
              </button>
            ))}
            {!choices.length && <p className="py-4 text-sm text-muted-foreground text-center">No countries match.</p>}
          </div>
        </div>
      </BottomSheet>
    </>
  );
}