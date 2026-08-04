import React from "react";
import { Link } from "react-router-dom";
import { ArrowLeft } from "lucide-react";

export function LegalSection({ title, children }) {
  return (
    <section className="space-y-1.5">
      <h2 className="text-sm font-semibold">{title}</h2>
      <p className="text-[0.8125rem] leading-relaxed text-muted-foreground">{children}</p>
    </section>
  );
}

export default function LegalPage({ title, updated, children }) {
  return (
    <div className="mx-auto max-w-lg px-4 pb-12 pt-4">
      <Link to="/settings" className="inline-flex items-center gap-1.5 text-sm text-muted-foreground hover:text-primary">
        <ArrowLeft className="h-4 w-4" /> Settings
      </Link>
      <h1 className="mt-3 text-[1.625rem] font-bold leading-tight">{title}</h1>
      <p className="mt-1 text-xs text-muted-foreground">Last updated {updated}</p>
      <div className="neu-raised mt-5 space-y-5 rounded-2xl bg-background p-5">{children}</div>
    </div>
  );
}