import React, { useCallback, useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { base44 } from "@/api/base44Client";
import { Button } from "@/components/ui/button";
import { Crown, Gem, Pencil, Plus, Trash2 } from "lucide-react";
import ListingCard from "@/components/listings/ListingCard";
import EmptyState from "@/components/common/EmptyState";
import Spinner from "@/components/common/Spinner";
import SignInPrompt from "@/components/common/SignInPrompt";
import useCurrentTrader from "@/hooks/useCurrentTrader";
import { TIERS, tierLimit } from "@/lib/gems";

export default function MyListings() {
  const { user, trader, loading } = useCurrentTrader();
  const [listings, setListings] = useState(null);

  const load = useCallback(async () => {
    if (!trader?.id) return;
    setListings(await base44.entities.Listing.filter({ trader_id: trader.id }, "-created_date", 200));
  }, [trader?.id]);

  useEffect(() => {
    load();
  }, [load]);

  const remove = async (id) => {
    await base44.entities.Listing.delete(id);
    load();
  };

  if (loading) return <Spinner />;
  if (!user) return <SignInPrompt title="Sign in to manage listings" />;
  if (!trader) return <SignInPrompt title="Create your trader profile" cta="Get started" to="/onboarding" />;

  const tier = trader.subscription_tier || "none";
  const limit = tierLimit(tier);
  const active = (listings || []).filter((l) => l.status !== "sold").length;
  const atLimit = active >= limit;

  return (
    <div className="px-4 pt-5 space-y-5">
      <div className="flex items-start justify-between gap-3">
        <div>
          <h1 className="text-[26px] font-bold leading-tight">My listings</h1>
          <p className="text-sm text-muted-foreground mt-1">
            {tier === "none"
              ? "A paid plan is required to publish listings."
              : `${active} of ${limit === Infinity ? "unlimited" : limit} active listings used — ${TIERS[tier].label} plan.`}
          </p>
        </div>
        {!atLimit && (
          <Button asChild size="icon" className="w-12 h-12 rounded-full shrink-0">
            <Link to="/my-listings/new" aria-label="New listing">
              <Plus className="w-5 h-5" />
            </Link>
          </Button>
        )}
      </div>

      {atLimit && (
        <div className="rounded-2xl border border-primary/30 bg-accent p-4">
          <div className="flex items-center gap-2">
            <Crown className="w-5 h-5 text-primary" />
            <h2 className="font-semibold text-accent-foreground">
              {tier === "none" ? "Subscribe to start listing" : "Listing limit reached"}
            </h2>
          </div>
          <p className="mt-1.5 text-sm text-accent-foreground/80">
            {tier === "none"
              ? "Choose a plan to publish gemstones, get badges and rank higher in the directory."
              : `Your ${TIERS[tier].label} plan allows ${limit} active listings. Upgrade for more.`}
          </p>
          <Button asChild className="mt-4 w-full h-11 font-semibold">
            <Link to="/subscription">View plans</Link>
          </Button>
        </div>
      )}

      {listings === null ? (
        <Spinner />
      ) : listings.length === 0 ? (
        <EmptyState
          icon={Gem}
          title="No listings yet"
          description="Publish your first gemstone to start receiving enquiries."
          action={
            !atLimit && (
              <Button asChild className="h-11 px-6 font-semibold">
                <Link to="/my-listings/new">Create listing</Link>
              </Button>
            )
          }
        />
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {listings.map((l) => (
            <div key={l.id} className="space-y-2">
              <ListingCard listing={l} />
              <div className="flex gap-2">
                <Button asChild variant="outline" size="sm" className="flex-1">
                  <Link to={`/my-listings/${l.id}/edit`}>
                    <Pencil className="w-3.5 h-3.5 mr-1.5" /> Edit
                  </Link>
                </Button>
                <Button variant="ghost" size="sm" onClick={() => remove(l.id)}>
                  <Trash2 className="w-3.5 h-3.5 text-destructive" />
                </Button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}