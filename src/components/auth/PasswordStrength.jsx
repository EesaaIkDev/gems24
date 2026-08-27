import React from "react";

export const MIN_PASSWORD_LENGTH = 8;

/** Length-based strength meter — no character-variety rules. */
export default function PasswordStrength({ value = "" }) {
  const len = value.length;
  const pct = Math.min(100, Math.round((len / 16) * 100));
  const label =
    len === 0 ? "" : len < MIN_PASSWORD_LENGTH ? `Too short — ${MIN_PASSWORD_LENGTH - len} more characters` : len < 14 ? "Good" : "Strong";
  const tone = len < MIN_PASSWORD_LENGTH ? "bg-destructive" : len < 14 ? "bg-amber-500" : "bg-primary";

  if (!len) return null;

  return (
    <div className="space-y-1.5">
      <div className="neu-inset-sm h-2 w-full overflow-hidden rounded-full bg-background">
        <div className={`h-full rounded-full transition-all ${tone}`} style={{ width: `${pct}%` }} />
      </div>
      <p className="text-xs text-muted-foreground">
        {label} · a long passphrase is safer than a short complicated one.
      </p>
    </div>
  );
}