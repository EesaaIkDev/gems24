import React from "react";
import { Link } from "react-router-dom";
import { Activity } from "lucide-react";

/** Compact list of recent updates from traders in the viewer's network. */
export default function ActivityStrip({ items }) {
  if (!items.length) return null;

  return (
    <section className="px-4 py-4 border-b border-border">
      <div className="flex items-center gap-2">
        <Activity className="w-4 h-4 text-primary" />
        <h2 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
          Network activity
        </h2>
      </div>
      <ul className="mt-3 space-y-2">
        {items.map((item) => (
          <li key={item.key} className="text-sm text-foreground/85">
            <Link to={item.to} className="hover:text-primary">
              <span className="font-semibold">{item.name}</span> {item.text}
            </Link>
          </li>
        ))}
      </ul>
    </section>
  );
}