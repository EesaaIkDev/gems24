import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Bookmark, CircleDot, Gem, MoreHorizontal, Pencil, Share2, Trash2, User } from "lucide-react";
import {
  DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuLabel, DropdownMenuSeparator, DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useToast } from "@/components/ui/use-toast";
import useSavedListings from "@/hooks/useSavedListings";
import { shareListing } from "@/lib/shareListing";
import { updateRecord } from "@/lib/offlineSync";
import { listingPath } from "@/lib/seo";
import { cap } from "@/lib/gems";
import DeleteListingDialog from "./DeleteListingDialog";

const STATUSES = ["available", "reserved", "sold"];

/** Three-dot actions for a listing. Owner-only actions appear only for the listing's trader. */
export default function ListingMenu({ listing, isOwner }) {
  const navigate = useNavigate();
  const { toast } = useToast();
  const { isSaved, toggle } = useSavedListings();
  const [confirmDelete, setConfirmDelete] = useState(false);
  const saved = isSaved(listing.id);

  const share = async () => {
    const result = await shareListing(listing);
    if (result === "copied") toast({ title: "Link copied" });
  };

  const setStatus = async (status) => {
    await updateRecord("Listing", listing.id, { status });
    window.dispatchEvent(new Event("app:refresh"));
    toast({ title: `Marked as ${status}` });
  };

  const item = "gap-2.5 rounded-lg py-2.5 text-sm";

  return (
    <>
      <DropdownMenu>
        <DropdownMenuTrigger
          aria-label="Listing actions"
          className="glass-press flex h-9 w-9 items-center justify-center rounded-full text-muted-foreground"
        >
          <MoreHorizontal className="h-5 w-5" />
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end" className="w-56 rounded-xl border-border bg-popover/90 p-1.5 shadow-lg backdrop-blur-xl backdrop-saturate-150">
          <DropdownMenuItem className={item} onSelect={() => navigate(listingPath(listing))}>
            <Gem className="h-4 w-4" /> View gemstone details
          </DropdownMenuItem>
          {!isOwner && (
            <DropdownMenuItem className={item} onSelect={() => navigate(`/trader/${listing.trader_id}`)}>
              <User className="h-4 w-4" /> View trader profile
            </DropdownMenuItem>
          )}
          <DropdownMenuItem className={item} onSelect={() => toggle(listing)}>
            <Bookmark className={`h-4 w-4 ${saved ? "fill-primary text-primary" : ""}`} /> {saved ? "Remove from saved" : "Save gemstone"}
          </DropdownMenuItem>
          <DropdownMenuItem className={item} onSelect={share}>
            <Share2 className="h-4 w-4" /> Share listing
          </DropdownMenuItem>
          {isOwner && (
            <>
              <DropdownMenuSeparator />
              <DropdownMenuItem className={item} onSelect={() => navigate(`/my-listings/${listing.id}/edit`)}>
                <Pencil className="h-4 w-4" /> Edit listing
              </DropdownMenuItem>
              <DropdownMenuLabel className="px-2 pt-2 text-[11px] font-semibold uppercase tracking-wide text-muted-foreground">
                Availability
              </DropdownMenuLabel>
              {STATUSES.filter((s) => s !== listing.status).map((s) => (
                <DropdownMenuItem key={s} className={item} onSelect={() => setStatus(s)}>
                  <CircleDot className="h-4 w-4" /> Mark as {cap(s).toLowerCase()}
                </DropdownMenuItem>
              ))}
              <DropdownMenuSeparator />
              <DropdownMenuItem className={`${item} text-destructive focus:text-destructive`} onSelect={() => setConfirmDelete(true)}>
                <Trash2 className="h-4 w-4" /> Delete listing
              </DropdownMenuItem>
            </>
          )}
        </DropdownMenuContent>
      </DropdownMenu>
      {isOwner && <DeleteListingDialog listing={listing} open={confirmDelete} onOpenChange={setConfirmDelete} />}
    </>
  );
}