import React from "react";

/** iOS-style grouped section: small heading above one solid card of rows. */
export function SettingsGroup({ title, children, footer }) {
  return (
    <section>
      {title && (
        <h2 className="mb-1.5 px-1 text-xs font-semibold uppercase tracking-wider text-muted-foreground">{title}</h2>
      )}
      <div className="divide-y divide-border overflow-hidden rounded-xl border border-border bg-card">{children}</div>
      {footer && <p className="mt-1.5 px-1 text-xs text-muted-foreground">{footer}</p>}
    </section>
  );
}

/** One row: icon, label with optional description, and a trailing control. */
export function SettingsRow({ icon: Icon, label, description, children, as: Comp = "div", ...props }) {
  return (
    <Comp className="flex items-center gap-3 px-4 py-3.5 transition-colors [a&]:active:bg-secondary" {...props}>
      {Icon && <Icon className="h-[18px] w-[18px] shrink-0 text-primary" />}
      <div className="min-w-0 flex-1">
        <p className="text-sm font-medium">{label}</p>
        {description && <p className="text-xs text-muted-foreground">{description}</p>}
      </div>
      {children}
    </Comp>
  );
}