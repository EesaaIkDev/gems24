import React from "react";
import { Search, X } from "lucide-react";

/** Compact frosted-glass search field with a clear button. */
export default function GlassSearch({ value, onChange, placeholder, label }) {
  return (
    <div className="glass-frost flex h-11 items-center rounded-full pl-3.5 shadow-none focus-within:border-primary">
      <Search className="h-[1.125rem] w-[1.125rem] shrink-0 text-primary" aria-hidden="true" />
      <input
        type="search"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        aria-label={label || placeholder}
        className="h-full min-w-0 flex-1 appearance-none bg-transparent px-2.5 text-base outline-none placeholder:text-muted-foreground focus-visible:ring-0 focus-visible:ring-offset-0 md:text-[15px] [&::-webkit-search-cancel-button]:hidden"
      />
      {value && (
        <button
          type="button"
          onClick={() => onChange("")}
          aria-label="Clear search"
          className="flex h-11 w-11 shrink-0 items-center justify-center text-muted-foreground"
        >
          <X className="h-[1.125rem] w-[1.125rem]" />
        </button>
      )}
    </div>
  );
}