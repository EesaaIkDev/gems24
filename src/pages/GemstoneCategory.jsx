import React, { useMemo } from "react";
import { Link, useParams } from "react-router-dom";
import { base44 } from "@/api/base44Client";
import { Gem } from "lucide-react";
import ListingCard from "@/components/listings/ListingCard";
import Spinner from "@/components/common/Spinner";
import EmptyState from "@/components/common/EmptyState";
import Seo from "@/components/seo/Seo";
import CategoryLinks from "@/components/seo/CategoryLinks";
import useOfflineEntity from "@/hooks/useOfflineEntity";
import { tierRank } from "@/lib/gems";
import { CATEGORIES, SITE, absolute, categoryBySlug, listingTitle, listingPath } from "@/lib/seo";

/** Indexable landing page for one gemstone variety. */
export default function GemstoneCategory() {
  const { slug } = useParams();
  const category = categoryBySlug(slug);
  const { rows: listings } = useOfflineEntity("Listing", () => base44.entities.Listing.list("-created_date", 200), []);

  const stones = useMemo(
    () =>
      (listings || [])
        .filter((l) => l.gemstone_type === category?.type && l.status !== "sold")
        .sort((a, b) => tierRank(b.trader_tier) - tierRank(a.trader_tier)),
    [listings, category]
  );

  if (!category)
    return (
      <div className="px-4 pt-6">
        <Seo title="Gemstone category not found — Gems24" robots="noindex, follow" />
        <EmptyState icon={Gem} title="Unknown gemstone category" description="Browse the marketplace to find stones by type." />
        <CategoryLinks />
      </div>
    );

  const jsonLd = [
    {
      "@context": "https://schema.org",
      "@type": "BreadcrumbList",
      itemListElement: [
        { "@type": "ListItem", position: 1, name: "Gems24", item: SITE.url },
        { "@type": "ListItem", position: 2, name: "Gemstone marketplace", item: absolute("/gemstones") },
        { "@type": "ListItem", position: 3, name: category.name, item: absolute(`/gemstones/${category.slug}`) },
      ],
    },
    stones.length
      ? {
          "@context": "https://schema.org",
          "@type": "ItemList",
          name: `${category.name} listings on Gems24`,
          numberOfItems: stones.length,
          itemListElement: stones.slice(0, 25).map((l, i) => ({
            "@type": "ListItem",
            position: i + 1,
            name: listingTitle(l),
            url: absolute(listingPath(l)),
          })),
        }
      : null,
  ];

  return (
    <div className="px-3.5 pt-4 pb-4 space-y-4">
      <Seo
        title={`${category.title} | Gems24`}
        description={category.description}
        canonical={absolute(`/gemstones/${category.slug}`)}
        jsonLd={jsonLd}
      />

      <nav aria-label="Breadcrumb" className="text-xs text-muted-foreground">
        <Link to="/gemstones" className="hover:text-primary">
          Gemstone marketplace
        </Link>
        <span aria-hidden="true"> / </span>
        <span className="text-foreground">{category.name}</span>
      </nav>

      <header>
        <h1 className="text-[1.375rem] font-bold leading-tight">{category.name} for sale from gemstone traders</h1>
        <p className="mt-2 text-sm leading-relaxed text-muted-foreground">{category.intro}</p>
      </header>

      <section aria-labelledby="cat-listings" className="space-y-3">
        <h2 id="cat-listings" className="text-sm font-semibold uppercase tracking-wider text-muted-foreground">
          Available {category.name.toLowerCase()} listings ({stones.length})
        </h2>
        {listings === null ? (
          <Spinner />
        ) : stones.length === 0 ? (
          <EmptyState
            icon={Gem}
            title={`No ${category.name.toLowerCase()} listed right now`}
            description="New stones are published by traders daily — browse the full marketplace in the meantime."
          />
        ) : (
          <div className="grid grid-cols-2 lg:grid-cols-3 gap-4">
            {stones.map((l) => (
              <ListingCard key={l.id} listing={l} />
            ))}
          </div>
        )}
      </section>

      <CategoryLinks exclude={category.slug} />

      <p className="text-xs leading-relaxed text-muted-foreground">
        Trading {category.name.toLowerCase()} yourself? <Link to="/gemstones" className="text-primary">Browse gemstone dealers on Gems24</Link> or{" "}
        <Link to="/about" className="text-primary">read how the Gems24 trade network works</Link>.
      </p>
      <p className="sr-only">{CATEGORIES.length} gemstone categories are available on Gems24.</p>
    </div>
  );
}