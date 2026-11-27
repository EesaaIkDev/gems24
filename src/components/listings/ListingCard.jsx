import React from "react";
import { Link } from "react-router-dom";
import { Image } from "@/components/ui/image";
import { BadgeCheck, Gem, ShieldQuestion } from "lucide-react";
import BookmarkButton from "./BookmarkButton";
import { cap } from "@/lib/gems";
import { listingAlt, listingPath } from "@/lib/seo";

const STATUS = {
  available: "text-primary",
  reserved: "text-amber-700 dark:text-amber-400",
  sold: "text-muted-foreground",
};

const TREATMENT = {
  unheated: "bg-accent text-accent-foreground",
  heated: "bg-secondary text-foreground",
};

const pill = "min-w-0 truncate rounded-full px-2 py-0.5 text-[11px]";

/** Compact marketplace tile: photo first, then the facts a buyer scans for. */
export default function ListingCard({ listing }) {
  const photo = listing.photos?.[0];
  return (
    <Link
      to={listingPath(listing)}
      className="flex h-full flex-col overflow-hidden rounded-xl border border-border bg-card transition-colors active:bg-secondary"
    >
      <div className="relative aspect-[4/3] overflow-hidden bg-secondary">
        {photo ? (
          <Image src={photo} alt={listingAlt(listing)} className="h-full w-full mix-blend-multiply dark:mix-blend-normal" />
        ) : (
          <div className="flex h-full w-full items-center justify-center">
            <Gem className="h-8 w-8 text-muted-foreground/40" />
          </div>
        )}
        <BookmarkButton listing={listing} className="absolute right-2 top-2" />
      </div>

      <div className="flex flex-1 flex-col p-3">
        <span className={`text-[11px] font-semibold uppercase tracking-wide ${STATUS[listing.status] || ""}`}>
          {cap(listing.status)}
        </span>
        <div className="mt-0.5 flex items-baseline justify-between gap-2">
          <h3 className="truncate text-[15px] font-bold leading-tight">{cap(listing.gemstone_type)}</h3>
          <span className="whitespace-nowrap text-[15px] font-bold">{listing.weight_carats} ct</span>
        </div>
        <div className="mb-2.5 mt-2 flex min-w-0 flex-wrap gap-1">
          <span className={`${pill} font-medium ${TREATMENT[listing.treatment] || "bg-secondary text-foreground"}`}>
            {cap(listing.treatment)}
          </span>
          {listing.color && <span className={`${pill} bg-secondary text-foreground`}>{listing.color}</span>}
          {listing.origin && <span className={`${pill} bg-secondary text-foreground`} title="Origin">{listing.origin}</span>}
        </div>
        <div className="mt-auto flex min-w-0 items-center gap-1 border-t border-border pt-2 text-[11px] text-muted-foreground">
          {listing.trader_verified ? (
            <BadgeCheck className="h-3.5 w-3.5 shrink-0 text-primary" aria-label="Verified seller" />
          ) : (
            <ShieldQuestion className="h-3.5 w-3.5 shrink-0" aria-label="Unverified seller" />
          )}
          <span className="max-w-[65%] shrink-0 truncate text-foreground">{listing.trader_name}</span>
          {listing.trader_country && <span className="min-w-0 truncate">· {listing.trader_country}</span>}
        </div>
      </div>
    </Link>
  );
}