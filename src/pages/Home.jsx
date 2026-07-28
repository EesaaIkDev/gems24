import React, { useEffect, useMemo, useState } from "react";
import { base44 } from "@/api/base44Client";
import ListingCard from "@/components/listings/ListingCard";
import ListingFilters from "@/components/listings/ListingFilters";
import Spinner from "@/components/common/Spinner";
import EmptyState from "@/components/common/EmptyState";
import { Gem, Sparkles } from "lucide-react";
import { tierRank } from "@/lib/gems";

export default function Home() {
  const [listings, setListings] = useState(null);
  const [filters, setFilters] = useState({ q: "", type: "", treatment: "", country: "", minCt: "", maxCt: "" });

  useEffect(() => {
    base44.entities.Listing.list("-created_date", 200).then(setListings);
  }, []);

  const countries = useMemo(
    () => [...new Set((listings || []).map((l) => l.trader_country).filter(Boolean))].sort().slice(0, 8),
    [listings]
  );

  const filtered = useMemo(() => {
    if (!listings) return [];
    const q = filters.q.toLowerCase();
    return listings
      .filter((l) => l.status !== "sold")
      .filter((l) => (filters.type ? l.gemstone_type === filters.type : true))
      .filter((l) => (filters.treatment ? l.treatment === filters.treatment : true))
      .filter((l) => (filters.country ? l.trader_country === filters.country : true))
      .filter((l) => (filters.minCt ? l.weight_carats >= Number(filters.minCt) : true))
      .filter((l) => (filters.maxCt ? l.weight_carats <= Number(filters.maxCt) : true))
      .filter((l) =>
        q
          ? [l.gemstone_type, l.color, l.origin, l.description, l.trader_name]
              .filter(Boolean)
              .some((v) => String(v).toLowerCase().includes(q))
          : true
      )
      .sort((a, b) => tierRank(b.trader_tier) - tierRank(a.trader_tier));
  }, [listings, filters]);

  const featured = useMemo(
    () => (listings || []).filter((l) => l.trader_tier === "platinum" && l.status === "available").slice(0, 4),
    [listings]
  );

  return (
    <div className="px-4 pt-5 space-y-5">
      <div>
        <h1 className="text-[1.625rem] font-bold leading-tight">Discover gemstones</h1>
        <p className="text-sm text-muted-foreground mt-1">
          Browse stones from verified traders worldwide. Network directly — no prices shown publicly.
        </p>
      </div>

      <ListingFilters filters={filters} setFilters={setFilters} countries={countries} />

      {listings === null ? (
        <Spinner />
      ) : (
        <>
          {featured.length > 0 && !filters.q && !filters.type && (
            <section className="space-y-3">
              <div className="flex items-center gap-2">
                <Sparkles className="w-4 h-4 text-primary" />
                <h2 className="text-sm font-semibold uppercase tracking-wider text-muted-foreground">Featured</h2>
              </div>
              <div className="flex gap-3 overflow-x-auto -mx-4 px-4 pb-2 scrollbar-none">
                {featured.map((l) => (
                  <div key={l.id} className="w-[70%] max-w-[260px] shrink-0">
                    <ListingCard listing={l} />
                  </div>
                ))}
              </div>
            </section>
          )}

          <section className="space-y-3">
            <h2 className="text-sm font-semibold uppercase tracking-wider text-muted-foreground">
              {filtered.length} {filtered.length === 1 ? "stone" : "stones"}
            </h2>
            {filtered.length === 0 ? (
              <EmptyState icon={Gem} title="No stones match" description="Try clearing a filter or widening the carat range." />
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                {filtered.map((l) => (
                  <ListingCard key={l.id} listing={l} />
                ))}
              </div>
            )}
          </section>
        </>
      )}
    </div>
  );
}