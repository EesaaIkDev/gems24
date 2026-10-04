import React, { useState } from "react";
import { Input } from "@/components/ui/input";
import { Check } from "lucide-react";

export default function CountryFilter({ countries, selected = [], onChange }) {
  const [query, setQuery] = useState("");
  const choices = countries.filter((c) => c.toLowerCase().includes(query.trim().toLowerCase()));
  return <div className="space-y-2">
    <Input aria-label="Search countries" placeholder="Search countries…" value={query} onChange={(e) => setQuery(e.target.value)} className="h-11 text-base" />
    <div className="flex items-center justify-between text-xs text-muted-foreground">
      <span>{selected.length ? `${selected.length} selected` : "All countries"}</span>
      {selected.length > 0 && <button type="button" className="min-h-11 px-2 text-primary" onClick={() => onChange([])}>Clear</button>}
    </div>
    <div data-vaul-no-drag className="max-h-52 overflow-y-auto overscroll-contain scrollbar-none">
      {choices.map((country) => <button type="button" key={country} aria-pressed={selected.includes(country)}
        onClick={() => onChange(selected.includes(country) ? selected.filter((c) => c !== country) : [...selected, country])}
        className="flex w-full min-h-11 items-center justify-between gap-3 py-2 text-left text-sm">
        <span>{country}</span>{selected.includes(country) && <Check className="h-4 w-4 shrink-0 text-primary" />}
      </button>)}
      {!choices.length && <p className="py-4 text-sm text-muted-foreground">No countries match.</p>}
    </div>
  </div>;
}