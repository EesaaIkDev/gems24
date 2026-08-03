import React from "react";
import { Input } from "@/components/ui/input";
import { Search, X } from "lucide-react";

/** Neomorphic inset search field for the Home feed. */
export default function FeedSearch({ value, onChange }) {
  return (
    <div className="relative">
      <Search className="absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
      <Input
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder="Search type, carats or origin…"
        aria-label="Search the feed"
        className="h-12 rounded-full pl-11 pr-11"
      />
      {value && (
        <button
          type="button"
          onClick={() => onChange("")}
          aria-label="Clear search"
          className="neu-raised-xs absolute right-3 top-1/2 flex h-7 w-7 -translate-y-1/2 items-center justify-center rounded-full bg-background"
        >
          <X className="h-3.5 w-3.5 text-muted-foreground" />
        </button>
      )}
    </div>
  );
}