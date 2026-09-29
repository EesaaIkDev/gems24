import React, { useMemo, useState } from "react";
import { Check, ChevronDown, Search } from "lucide-react";
import BottomSheet from "@/components/ui/bottom-sheet";
import { Input } from "@/components/ui/input";

/** Select field that opens a searchable bottom sheet of options. */
export default function SheetSelect({ value, onChange, options, placeholder, title, className = "" }) {
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState("");
  const selected = options.find((o) => o.value === value);

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    return q ? options.filter((o) => o.label.toLowerCase().includes(q)) : options;
  }, [options, query]);

  const pick = (v) => {
    onChange(v);
    setOpen(false);
    setQuery("");
  };

  return (
    <>
      <button
        type="button"
        onClick={() => setOpen(true)}
        className={`neu-inset flex h-11 w-full min-w-0 items-center justify-between gap-2 rounded-2xl bg-background px-3 text-left text-sm ${className}`}
      >
        <span className={`truncate ${selected || value ? "text-foreground" : "text-muted-foreground"}`}>
          {selected?.label || value || placeholder}
        </span>
        <ChevronDown className="h-4 w-4 shrink-0 text-muted-foreground" aria-hidden="true" />
      </button>

      <BottomSheet open={open} onOpenChange={setOpen} title={title}>
        <div className="relative mb-3">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" aria-hidden="true" />
          <Input value={query} onChange={(e) => setQuery(e.target.value)} placeholder="Search" className="h-11 pl-9" />
        </div>
        <ul className="-mx-2 max-h-[60vh] overflow-y-auto">
          {filtered.map((o) => (
            <li key={o.key || o.value}>
              <button
                type="button"
                onClick={() => pick(o.value)}
                className="flex w-full items-center justify-between rounded-xl px-3 py-3 text-left text-sm active:bg-muted"
              >
                <span className="truncate">{o.label}</span>
                {o.value === value && <Check className="h-4 w-4 shrink-0 text-primary" aria-hidden="true" />}
              </button>
            </li>
          ))}
          {!filtered.length && <li className="px-3 py-6 text-center text-sm text-muted-foreground">No matches</li>}
        </ul>
      </BottomSheet>
    </>
  );
}