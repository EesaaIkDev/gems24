import React, { useEffect, useMemo, useState } from "react";
import { base44 } from "@/api/base44Client";
import { Input } from "@/components/ui/input";
import { Search, Users } from "lucide-react";
import TraderCard from "@/components/traders/TraderCard";
import Spinner from "@/components/common/Spinner";
import EmptyState from "@/components/common/EmptyState";
import { GEM_TYPES, TIER_ORDER, TIERS, cap, tierRank } from "@/lib/gems";

export default function Directory() {
  const [traders, setTraders] = useState(null);
  const [q, setQ] = useState("");
  const [specialty, setSpecialty] = useState("");
  const [tier, setTier] = useState("");
  const [country, setCountry] = useState("");

  useEffect(() => {
    base44.entities.Trader.filter({ account_type: "trader" }, "-created_date", 200).then(setTraders);
  }, []);

  const countries = useMemo(
    () => [...new Set((traders || []).map((t) => t.country).filter(Boolean))].sort(),
    [traders]
  );

  const chip = (active) =>
    `shrink-0 rounded-full border px-3.5 py-1.5 text-xs font-medium transition-colors ${
      active ? "bg-primary text-primary-foreground border-primary" : "bg-card border-border text-muted-foreground"
    }`;

  const filtered = useMemo(() => {
    if (!traders) return [];
    const s = q.toLowerCase();
    return traders
      .filter((t) => (specialty ? t.specialties?.includes(specialty) : true))
      .filter((t) => (tier ? t.subscription_tier === tier : true))
      .filter((t) => (country ? t.country === country : true))
      .filter((t) =>
        s ? [t.full_name, t.business_name].filter(Boolean).some((v) => v.toLowerCase().includes(s)) : true
      )
      .sort((a, b) => tierRank(b.subscription_tier) - tierRank(a.subscription_tier));
  }, [traders, q, specialty, tier, country]);

  return (
    <div className="px-4 pt-5 space-y-5">
      <div>
        <h1 className="text-[26px] font-bold leading-tight">Trader directory</h1>
        <p className="text-sm text-muted-foreground mt-1">Find and connect with gemstone traders worldwide.</p>
      </div>

      <div className="relative">
        <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
        <Input
          value={q}
          onChange={(e) => setQ(e.target.value)}
          placeholder="Search by name or business…"
          className="pl-10 h-12 rounded-xl bg-card"
        />
      </div>

      <div className="space-y-2">
        <div className="flex gap-2 overflow-x-auto -mx-4 px-4 pb-1 scrollbar-none">
          <button className={chip(!specialty)} onClick={() => setSpecialty("")}>All specialties</button>
          {GEM_TYPES.map((g) => (
            <button key={g} className={chip(specialty === g)} onClick={() => setSpecialty(specialty === g ? "" : g)}>
              {cap(g)}
            </button>
          ))}
        </div>
        <div className="flex gap-2 overflow-x-auto -mx-4 px-4 pb-1 scrollbar-none">
          {TIER_ORDER.map((t) => (
            <button key={t} className={chip(tier === t)} onClick={() => setTier(tier === t ? "" : t)}>
              {TIERS[t].label}
            </button>
          ))}
          {countries.map((c) => (
            <button key={c} className={chip(country === c)} onClick={() => setCountry(country === c ? "" : c)}>
              {c}
            </button>
          ))}
        </div>
      </div>

      {traders === null ? (
        <Spinner />
      ) : filtered.length === 0 ? (
        <EmptyState icon={Users} title="No traders found" description="Try a different search or clear your filters." />
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-3">
          {filtered.map((t) => (
            <TraderCard key={t.id} trader={t} />
          ))}
        </div>
      )}
    </div>
  );
}