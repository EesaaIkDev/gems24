/** Shared emerald-cut chip styling for filter rows. */
export const chipClass = (active) =>
  `gem-corners gem-btn gem-chip shrink-0 border px-3.5 py-1.5 text-xs font-semibold ${
    active
      ? "gem-btn-raised bg-primary text-primary-foreground border-primary shadow-[inset_0_1px_0_rgba(255,255,255,0.45)]"
      : "bg-card border-border text-muted-foreground hover:border-primary/40"
  }`;