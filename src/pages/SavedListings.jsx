import React from "react";
import { Link } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { ArrowLeft, Bookmark } from "lucide-react";
import { base44 } from "@/api/base44Client";
import { Button } from "@/components/ui/button";
import ListingCard from "@/components/listings/ListingCard";
import ListingGridSkeleton from "@/components/listings/ListingGridSkeleton";
import UnavailableSaved from "@/components/listings/UnavailableSaved";
import EmptyState from "@/components/common/EmptyState";
import LoadError from "@/components/common/LoadError";
import SignInPrompt from "@/components/common/SignInPrompt";
import useSavedListings from "@/hooks/useSavedListings";

export default function SavedListings() {
  const { saved, isLoading, remove, signedIn } = useSavedListings();
  const ids = saved.map((s) => s.listing_id).filter((id) => !id.startsWith("tmp-"));

  const listingsQuery = useQuery({
    queryKey: ["saved-listing-details", ids.join(",")],
    enabled: ids.length > 0,
    queryFn: () => base44.entities.Listing.filter({ id: { $in: ids } }, "-created_date", ids.length),
  });

  if (!signedIn) return <SignInPrompt title="Log in to see saved gemstones" />;

  const byId = Object.fromEntries((listingsQuery.data || []).map((l) => [l.id, l]));
  const loading = isLoading || (ids.length > 0 && listingsQuery.isLoading);
  const missing = listingsQuery.data ? saved.filter((s) => !byId[s.listing_id] && !s.id.startsWith("tmp-")) : [];

  return (
    <div className="mx-auto max-w-5xl px-4 pb-6 pt-4">
      <Link to="/profile" className="inline-flex items-center gap-1.5 text-sm text-muted-foreground">
        <ArrowLeft className="h-4 w-4" /> Profile
      </Link>
      <h1 className="mt-3 text-2xl font-bold">Saved gemstones</h1>

      <div className="mt-4">
        {listingsQuery.error ? (
          <LoadError title="Couldn't load saved gemstones" onRetry={() => listingsQuery.refetch()} />
        ) : loading ? (
          <ListingGridSkeleton />
        ) : saved.length === 0 ? (
          <EmptyState
            icon={Bookmark}
            title="No saved gemstones yet"
            description="Tap the bookmark on any stone to keep it here."
            action={<Button asChild className="px-6"><Link to="/gemstones">Browse the marketplace</Link></Button>}
          />
        ) : (
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-3 md:grid-cols-3 lg:grid-cols-4">
              {saved.filter((s) => byId[s.listing_id]).map((s) => (
                <ListingCard key={s.id} listing={byId[s.listing_id]} />
              ))}
            </div>
            {missing.length > 0 && <UnavailableSaved items={missing} onRemove={remove} />}
          </div>
        )}
      </div>
    </div>
  );
}