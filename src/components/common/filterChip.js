/** Shared emerald-cut chip styling for filter rows.
 *  Inactive chips are filled rather than outlined — clip-path would cut a
 *  border away on the facets and leave the edges looking torn. */
export const chipClass = (active) =>
  `gem-corners gem-btn gem-chip shrink-0 px-3.5 py-1.5 text-xs font-semibold ${
    active
      ? "gem-btn-raised bg-primary text-primary-foreground"
      : "bg-secondary text-muted-foreground [text-shadow:0_1px_0_rgba(255,255,255,0.8)]"
  }`;