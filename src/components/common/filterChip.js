/** Shared flat pill styling for filter rows. The invisible ::before pad
 *  keeps the tap target at 44px while the pill itself stays compact. */
export const chipClass = (active) =>
  `relative shrink-0 rounded-full border border-white/50 bg-white/55 px-3.5 py-1.5 text-[13px] font-medium backdrop-blur-md transition-colors before:absolute before:-inset-y-1 before:inset-x-0 before:content-[''] ${
    active
      ? "border-primary/60 bg-primary/10 text-accent-foreground"
      : "text-muted-foreground hover:bg-white/75 active:bg-white/70"
  }`;