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
import { tierRank } from "@/lib/gems";

export default function Gemstones() {
  const [listings, setListings] = useState(null);
  const [traders, setTraders] = useState(null);
  const [stoneFilters, setStoneFilters] = useState({ q: "", type: "", treatment: "", country: "", minCt: "", maxCt: "" });
  const [traderFilters, setTraderFilters] = useState({ specialty: "", tier: "", country: "" });
  const [q, setQ] = useState("");

  useEffect(() => {
    base44.entities.Listing.list("-created_date", 200).then(setListings);
    base44.entities.Trader.filter({ account_type: "trader" }, "-created_date", 200).then(setTraders);
  }, []);

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
    <div className="px-4 pt-5 space-y-4">
      <h1 className="text-[1.625rem] font-bold leading-tight">Gemstones</h1>

      <div className="relative">
        <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
        <Input
          value={q}
          onChange={(e) => setQ(e.target.value)}
          placeholder="Search stones, traders, origins…"
          className="pl-10 h-12 rounded-xl bg-card"
        />
      </div>

      <Tabs defaultValue="stones">
        <TabsList className="grid grid-cols-2 w-full h-11 rounded-xl">
          <TabsTrigger value="stones" className="rounded-lg">Stones</TabsTrigger>
          <TabsTrigger value="traders" className="rounded-lg">Traders</TabsTrigger>
        </TabsList>

        <TabsContent value="stones" className="mt-4 space-y-4">
          <ListingFilters filters={stoneFilters} setFilters={setStoneFilters} countries={stoneCountries} />
          {listings === null ? (
            <Spinner />
          ) : filteredStones.length === 0 ? (
            <EmptyState icon={Gem} title="No stones match" description="Try clearing a filter or widening the carat range." />
          ) : (
            <div className="grid grid-cols-2 lg:grid-cols-3 gap-3">
              {filteredStones.map((l) => (
                <ListingCard key={l.id} listing={l} />
              ))}
            </div>
          )}
        </TabsContent>

        <TabsContent value="traders" className="mt-4 space-y-4">
          <TraderFilters filters={traderFilters} setFilters={setTraderFilters} countries={traderCountries} />
          {traders === null ? (
            <Spinner />
          ) : filteredTraders.length === 0 ? (
            <EmptyState icon={Users} title="No traders found" description="Try a different search or clear your filters." />
          ) : (
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-3">
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