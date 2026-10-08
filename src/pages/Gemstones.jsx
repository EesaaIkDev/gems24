import React, { useEffect, useMemo, useState } from "react";
import { base44 } from "@/api/base44Client";
import { Input } from "@/components/ui/input";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Gem, Search, Users } from "lucide-react";
import ListingCard from "@/components/listings/ListingCard";
import ListingFilters from "@/components/listings/ListingFilters";
import TraderCard from "@/components/traders/TraderCard";
import TraderFilters from "@/components/traders/TraderFilters";
import Spinner from "@/components/common/Spinner";
import EmptyState from "@/components/common/EmptyState";
import usePopularDefaults from "@/hooks/usePopularDefaults";
import useOfflineEntity from "@/hooks/useOfflineEntity";
import usePagedListings, { ON_MARKET } from "@/hooks/usePagedListings";
import LoadMore from "@/components/common/LoadMore";
import { GEM_TYPES, tierRank } from "@/lib/gems";
import useCountries from "@/hooks/useCountries";
import { matches, values } from "@/components/common/filterValues";
import Seo from "@/components/seo/Seo";
import CategoryLinks from "@/components/seo/CategoryLinks";
import { SITE, absolute } from "@/lib/seo";

/** The structured stone filters as a server query — type, status, treatment, country and carats. */
// Multi-value filters use an explicit $in: the array shorthand drops results
// when combined with cursor pages on the live backend.
function stoneQuery(f) {
  const query = { ...ON_MARKET };
  if (values(f.type).length) query.gemstone_type = { $in: values(f.type) };
  if (values(f.treatment).length) query.treatment = { $in: values(f.treatment) };
  if (values(f.country).length) query.trader_country = { $in: values(f.country) };
  const min = f.minCt === "" ? null : Number(f.minCt);
  const max = f.maxCt === "" ? null : Number(f.maxCt);
  if (Number.isFinite(min) || Number.isFinite(max)) {
    query.weight_carats = {
      ...(Number.isFinite(min) ? { $gte: min } : {}),
      ...(Number.isFinite(max) ? { $lte: max } : {}),
    };
  }
  return query;
}

export default function Gemstones() {
  const tradersQuery = useOfflineEntity(
    "Trader",
    () => base44.entities.Trader.filter({ account_type: "trader" }, "-created_date", 200),
    []
  );
  const traders = tradersQuery.rows;
  const [stoneFilters, setStoneFilters] = useState({ q: "", type: [], treatment: [], country: [], minCt: "", maxCt: "" });
  const [defaultsApplied, setDefaultsApplied] = useState(false);
  const [traderFilters, setTraderFilters] = useState({ specialty: [], tier: [], country: [] });
  const { countries } = useCountries();
  const [q, setQ] = useState("");
  const popular = usePopularDefaults();

  // Smart defaults: land on the most-listed stone type instead of a blank grid.
  useEffect(() => {
    if (!popular) return;
    setStoneFilters((f) => (values(f.type).length ? f : { ...f, type: popular.gemstone_type ? [popular.gemstone_type] : [] }));
    setDefaultsApplied(true);
  }, [popular]);

  // Waits for the default type so the first request is the one actually shown.
  const stones = usePagedListings({ query: stoneQuery(stoneFilters), sort: "-placement", enabled: defaultsApplied });
  const listings = stones.items;

  const countryNames = useMemo(() => [...new Set([...countries.map((c) => c.name), ...(listings || []).map((l) => l.trader_country), ...(traders || []).map((t) => t.country)].filter(Boolean))].sort(), [countries, listings, traders]);
  const specialties = useMemo(() => [...new Set([...GEM_TYPES, ...(traders || []).flatMap((t) => t.specialties || [])])], [traders]);

  // Filtering and grade-first order happen on the server; only free-text search
  // runs here, over the pages loaded so far (LoadMore keeps fetching while searching).
  const filteredStones = useMemo(() => {
    if (!listings) return [];
    const s = (q || stoneFilters.q).toLowerCase();
    if (!s) return listings;
    return listings.filter((l) =>
      [l.gemstone_type, l.color, l.origin, l.description, l.trader_name]
        .filter(Boolean)
        .some((v) => String(v).toLowerCase().includes(s))
    );
  }, [listings, stoneFilters.q, q]);

  const filteredTraders = useMemo(() => {
    if (!traders) return [];
    const s = q.toLowerCase();
    return traders
      .filter((t) => !values(traderFilters.specialty).length || values(traderFilters.specialty).some((s) => t.specialties?.includes(s)))
      .filter((t) => matches(traderFilters.tier, t.subscription_tier || "none"))
      .filter((t) => matches(traderFilters.country, t.country))
      .filter((t) =>
        s ? [t.full_name, t.business_name].filter(Boolean).some((v) => v.toLowerCase().includes(s)) : true
      )
      .sort((a, b) => tierRank(b.subscription_tier) - tierRank(a.subscription_tier));
  }, [traders, traderFilters, q]);

  return (
    <div className="px-3.5 pt-4 space-y-2.5">
      <Seo
        canonical={absolute("/gemstones")}
        jsonLd={{
          "@context": "https://schema.org",
          "@type": "CollectionPage",
          name: "Gemstone marketplace",
          url: absolute("/gemstones"),
          description: SITE.description,
          isPartOf: { "@type": "WebSite", name: SITE.name, url: SITE.url },
        }}
      />
      <h1 className="text-[1.375rem] font-bold leading-tight">Gemstone marketplace</h1>

      <div className="relative">
        <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-[15px] w-[15px] text-muted-foreground" />
        <Input
          value={q}
          onChange={(e) => setQ(e.target.value)}
          placeholder="Search marketplace"
          className="h-10 rounded-xl pl-10 text-sm"
        />
      </div>

      <Tabs defaultValue="stones">
        <TabsList className="grid grid-cols-2 w-full h-10 rounded-xl">
          <TabsTrigger value="stones">Stones</TabsTrigger>
          <TabsTrigger value="traders">Traders</TabsTrigger>
        </TabsList>

        <TabsContent value="stones" className="mt-3 space-y-3">
          <ListingFilters filters={stoneFilters} setFilters={setStoneFilters} countries={countryNames} />
          {listings === null ? (
            <Spinner />
          ) : filteredStones.length === 0 && !stones.hasMore ? (
            <EmptyState icon={Gem} title="No stones match" description="Try clearing a filter or widening the carat range." />
          ) : (
            <div className="grid grid-cols-2 lg:grid-cols-3 gap-4">
              {filteredStones.map((l) => (
                <ListingCard key={l.id} listing={l} />
              ))}
            </div>
          )}
          <LoadMore hasMore={stones.hasMore} loading={stones.loadingMore} onLoad={stones.loadMore} watch={listings?.length} />
        </TabsContent>

        <TabsContent value="traders" className="mt-3 space-y-3">
          <TraderFilters filters={traderFilters} setFilters={setTraderFilters} countries={countryNames} specialties={specialties} />
          {traders === null ? (
            <Spinner />
          ) : filteredTraders.length === 0 ? (
            <EmptyState icon={Users} title="No traders found" description="Try a different search or clear your filters." />
          ) : (
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
              {filteredTraders.map((t) => (
                <TraderCard key={t.id} trader={t} />
              ))}
            </div>
          )}
        </TabsContent>
      </Tabs>

      <CategoryLinks />
    </div>
  );
}