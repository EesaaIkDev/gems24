/** Shared emerald-cut chip styling for filter rows.
 *  Inactive chips are filled rather than outlined — clip-path would cut a
 *  border away on the facets and leave the edges looking torn. */
export const chipClass = (active) =>
  `gem-chip shrink-0 px-4 py-1.5 text-xs font-semibold transition-shadow bg-background ${
    active
      ? "neu-inset text-primary"
      : "neu-raised-sm text-foreground active:neu-inset-sm"
  }`;