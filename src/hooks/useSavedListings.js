import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useNavigate } from "react-router-dom";
import { base44 } from "@/api/base44Client";
import { useAuth } from "@/lib/AuthContext";
import { useToast } from "@/components/ui/use-toast";
import { haptic } from "@/lib/despia";
import { cap } from "@/lib/gems";

/** The signed-in user's bookmarked listings, shared across every card via one cached query. */
export default function useSavedListings() {
  const { user } = useAuth();
  const qc = useQueryClient();
  const navigate = useNavigate();
  const { toast } = useToast();
  const key = ["saved-listings", user?.id];

  const { data: saved = [], isLoading } = useQuery({
    queryKey: key,
    enabled: !!user?.id,
    staleTime: 60_000,
    queryFn: () => base44.entities.SavedListing.filter({ created_by_id: user.id }, "-created_date", 500),
  });

  const isSaved = (listingId) => saved.some((s) => s.listing_id === listingId);

  const toggle = async (listing) => {
    if (!user) {
      const back = window.location.pathname + window.location.search;
      navigate(`/login?returnTo=${encodeURIComponent(back)}`);
      return;
    }
    haptic("light");
    const existing = saved.filter((s) => s.listing_id === listing.id);
    const previous = saved;
    if (existing.length) {
      qc.setQueryData(key, saved.filter((s) => s.listing_id !== listing.id));
    } else {
      qc.setQueryData(key, [{ id: `tmp-${listing.id}`, listing_id: listing.id }, ...saved]);
    }
    try {
      if (existing.length) {
        await Promise.all(existing.filter((s) => !s.id.startsWith("tmp-")).map((s) => base44.entities.SavedListing.delete(s.id)));
      } else {
        await base44.entities.SavedListing.create({
          listing_id: listing.id,
          label: `${listing.weight_carats} ct ${cap(listing.gemstone_type)}`,
        });
      }
      qc.invalidateQueries({ queryKey: key });
    } catch {
      qc.setQueryData(key, previous);
      toast({ title: "Couldn't update your saved gemstones", description: "Please try again.", variant: "destructive" });
    }
  };

  const remove = async (record) => {
    qc.setQueryData(key, saved.filter((s) => s.id !== record.id));
    await base44.entities.SavedListing.delete(record.id);
    qc.invalidateQueries({ queryKey: key });
  };

  return { saved, isLoading, isSaved, toggle, remove, signedIn: !!user };
}