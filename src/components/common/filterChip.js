/** Shared emerald-cut chip styling for filter rows.
 *  Inactive chips are filled rather than outlined — clip-path would cut a
 *  border away on the facets and leave the edges looking torn. */
export const chipClass = (active) =>
  `gem-chip shrink-0 px-3 py-1 text-[0.6875rem] font-semibold transition-shadow bg-background ${
    active
      ? "neu-inset text-primary"
      : "neu-raised-xs text-muted-foreground active:neu-inset-sm"
  }`;