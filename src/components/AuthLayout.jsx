import React from "react";
import { LOGO_URL } from "@/lib/gems";

/** Shared sign-in / sign-up frame: official Gems24 lockup above one solid card. */
export default function AuthLayout({ title, subtitle, footer, children }) {
  return (
    <div className="h-full overflow-y-auto bg-background px-4 py-6 sm:flex sm:items-center sm:justify-center">
      <div className="mx-auto w-full max-w-md">
        <div className="mb-5 text-center sm:mb-8">
          <div className="mb-4 inline-flex items-center gap-2">
            <img src={LOGO_URL} alt="" className="h-10 w-10" />
            <span className="font-heading text-xl font-bold tracking-tight">Gems24</span>
          </div>
          <h1 className="text-2xl font-bold tracking-tight text-foreground sm:text-3xl">{title}</h1>
          {subtitle && <p className="mt-1.5 text-sm text-muted-foreground">{subtitle}</p>}
        </div>
        <div className="rounded-xl border border-border bg-card p-5 sm:p-8">
          {children}
        </div>
        {footer && (
          <p className="mt-5 text-center text-sm text-muted-foreground">{footer}</p>
        )}
      </div>
    </div>
  );
}