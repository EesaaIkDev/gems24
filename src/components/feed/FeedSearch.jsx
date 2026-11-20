import React from "react";
import { Input } from "@/components/ui/input";
import { Search, X } from "lucide-react";

/** Flat bordered search field for the Home feed, green search icon on the right. */
export default function FeedSearch({ value, onChange }) {
  return (
    <div className="relative">
      <Input
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder="Search feed"
        aria-label="Search the feed"
        className="h-12 pl-4 pr-12"
      />
      {value ? (
        <button
          type="button"
          onClick={() => onChange("")}
          aria-label="Clear search"
          className="absolute right-1 top-1/2 flex h-11 w-11 -translate-y-1/2 items-center justify-center text-muted-foreground"
        >
          <X className="h-5 w-5" />
        </button>
      ) : (
        <Search className="pointer-events-none absolute right-4 top-1/2 h-5 w-5 -translate-y-1/2 text-primary" aria-hidden="true" />
      )}
    </div>
  );
}