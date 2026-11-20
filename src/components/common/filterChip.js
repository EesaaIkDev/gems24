/** Shared flat pill styling for filter rows. The invisible ::before pad
 *  keeps the tap target at 44px while the pill itself stays compact. */
export const chipClass = (active) =>
  `relative shrink-0 rounded-full border px-3.5 py-1.5 text-[13px] font-medium transition-colors before:absolute before:-inset-y-1 before:inset-x-0 before:content-[''] ${
    active
      ? "border-primary bg-accent text-accent-foreground"
      : "border-border bg-background text-muted-foreground hover:bg-secondary active:bg-secondary"
  }`;