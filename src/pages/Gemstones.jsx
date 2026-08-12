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
import { tierRank } from "@/lib/gems";

export default function Gemstones() {
  const listingsQuery = useOfflineEntity(
    "Listing",
    () => base44.entities.Listing.list("-created_date", 200),
    []
  );
  const tradersQuery = useOfflineEntity(
    "Trader",
    () => base44.entities.Trader.filter({ account_type: "trader" }, "-created_date", 200),
    []
  );
  const listings = listingsQuery.rows;
  const traders = tradersQuery.rows;
  const [stoneFilters, setStoneFilters] = useState({ q: "", type: "", treatment: "", country: "", minCt: "", maxCt: "" });
  const [traderFilters, setTraderFilters] = useState({ specialty: "", tier: "", country: "" });
  const [q, setQ] = useState("");
  const popular = usePopularDefaults();

  // Smart defaults: land on the most-searched stone type instead of a blank grid.
  useEffect(() => {
    if (!popular) return;
    setStoneFilters((f) => (f.type ? f : { ...f, type: popular.gemstone_type }));
  }, [popular]);

  const stoneCountries = useMemo(
    () => [...new Set((listings || []).map((l) => l.trader_country).filter(Boolean))].sort().slice(0, 8),
    [listings]
  );
  const traderCountries = useMemo(
    () => [...new Set((traders || []).map((t) => t.country).filter(Boolean))].sort().slice(0, 8),
    [traders]
  );

  const filteredStones = useMemo(() => {
    if (!listings) return [];
    const s = (q || stoneFilters.q).toLowerCase();
    return listings
      .filter((l) => l.status !== "sold")
      .filter((l) => (stoneFilters.type ? l.gemstone_type === stoneFilters.type : true))
      .filter((l) => (stoneFilters.treatment ? l.treatment === stoneFilters.treatment : true))
      .filter((l) => (stoneFilters.country ? l.trader_country === stoneFilters.country : true))
      .filter((l) => (stoneFilters.minCt ? l.weight_carats >= Number(stoneFilters.minCt) : true))
      .filter((l) => (stoneFilters.maxCt ? l.weight_carats <= Number(stoneFilters.maxCt) : true))
      .filter((l) =>
        s
          ? [l.gemstone_type, l.color, l.origin, l.description, l.trader_name]
              .filter(Boolean)
              .some((v) => String(v).toLowerCase().includes(s))
          : true
      )
      .sort((a, b) => tierRank(b.trader_tier) - tierRank(a.trader_tier));
  }, [listings, stoneFilters, q]);

  const filteredTraders = useMemo(() => {
    if (!traders) return [];
    const s = q.toLowerCase();
    return traders
      .filter((t) => (traderFilters.specialty ? t.specialties?.includes(traderFilters.specialty) : true))
      .filter((t) => (traderFilters.tier ? t.subscription_tier === traderFilters.tier : true))
      .filter((t) => (traderFilters.country ? t.country === traderFilters.country : true))
      .filter((t) =>
        s ? [t.full_name, t.business_name].filter(Boolean).some((v) => v.toLowerCase().includes(s)) : true
      )
      .sort((a, b) => tierRank(b.subscription_tier) - tierRank(a.subscription_tier));
  }, [traders, traderFilters, q]);

  return (
    <div className="px-3.5 pt-4 space-y-3">
      <h1 className="text-[1.375rem] font-bold leading-tight">Gemstones</h1>

      <div className="relative">
        <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
        <Input
          value={q}
          onChange={(e) => setQ(e.target.value)}
          placeholder="Search stones, traders, origins…"
          className="pl-10 h-12 rounded-full"
        />
      </div>

      <Tabs defaultValue="stones">
        <TabsList className="grid grid-cols-2 w-full h-11 rounded-full">
          <TabsTrigger value="stones">Stones</TabsTrigger>
          <TabsTrigger value="traders">Traders</TabsTrigger>
        </TabsList>

        <TabsContent value="stones" className="mt-3 space-y-3">
          <ListingFilters filters={stoneFilters} setFilters={setStoneFilters} countries={stoneCountries} />
          {listings === null ? (
            <Spinner />
          ) : filteredStones.length === 0 ? (
            <EmptyState icon={Gem} title="No stones match" description="Try clearing a filter or widening the carat range." />
          ) : (
            <div className="grid grid-cols-2 lg:grid-cols-3 gap-4">
              {filteredStones.map((l) => (
                <ListingCard key={l.id} listing={l} />
              ))}
            </div>
          )}
        </TabsContent>

        <TabsContent value="traders" className="mt-3 space-y-3">
          <TraderFilters filters={traderFilters} setFilters={setTraderFilters} countries={traderCountries} />
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
    </div>
  );
}