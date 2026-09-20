import React from "react";
import { Input } from "@/components/ui/input";
import { Search, X } from "lucide-react";

/** Neomorphic inset search field for the Home feed. */
export default function FeedSearch({ value, onChange }) {
  return (
    <div className="relative">
      <Search className="absolute left-3.5 top-1/2 h-[15px] w-[15px] -translate-y-1/2 text-muted-foreground" />
      <Input
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder="Search feed"
        aria-label="Search the feed"
        className="h-10 rounded-xl pl-10 pr-10 text-sm"
      />
      {value && (
        <button
          type="button"
          onClick={() => onChange("")}
          aria-label="Clear search"
          className="absolute right-3.5 top-1/2 -translate-y-1/2 text-muted-foreground"
        >
          <X className="h-4 w-4" />
        </button>
      )}
    </div>
  );
}
