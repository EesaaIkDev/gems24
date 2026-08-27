import React from "react";
import { Link } from "react-router-dom";
import { CATEGORIES } from "@/lib/seo";

/** Descriptive internal links between gemstone category pages. */
export default function CategoryLinks({ exclude, title = "Browse by gemstone" }) {
  const items = CATEGORIES.filter((c) => c.slug !== exclude);

  return (
    <nav aria-label={title} className="space-y-2">
      <h2 className="text-sm font-semibold uppercase tracking-wider text-muted-foreground">{title}</h2>
      <div className="flex flex-wrap gap-2">
        {items.map((c) => (
          <Link
            key={c.slug}
            to={`/gemstones/${c.slug}`}
            className="neu-raised-sm tap-scale rounded-full bg-background px-3.5 py-1.5 text-xs font-medium"
          >
            {c.name} for sale
          </Link>
        ))}
      </div>
    </nav>
  );
}