import React from "react";
import { Link } from "react-router-dom";
import { Image } from "@/components/ui/image";
import { Gem, MapPin } from "lucide-react";
import SellerVerification from "@/components/common/SellerVerification";
import VerifiedBadge from "@/components/common/VerifiedBadge";
import { cap } from "@/lib/gems";
import { listingAlt, listingPath } from "@/lib/seo";

const STATUS = {
  available: "text-primary",
  reserved: "text-amber-700 dark:text-amber-400",
  sold: "text-muted-foreground",
};

const pill = "rounded-full bg-secondary px-2.5 py-1 text-[11px] font-medium text-foreground";

export default function ListingCard({ listing }) {
  const photo = listing.photos?.[0];
  return (
    <Link
      to={listingPath(listing)}
      className="flex h-full flex-col overflow-hidden rounded-xl border border-border bg-card transition-colors hover:bg-secondary active:bg-secondary"
    >
      <div className="relative aspect-[4/3] overflow-hidden bg-secondary">
        {photo ? (
          <Image src={photo} alt={listingAlt(listing)} className="h-full w-full" />
        ) : (
          <div className="flex h-full w-full items-center justify-center">
            <Gem className="h-8 w-8 text-muted-foreground/40" />
          </div>
        )}
      </div>

      <div className="flex items-center justify-between gap-2 px-3.5 pt-3">
        <span className={`text-[11px] font-semibold uppercase tracking-wide ${STATUS[listing.status] || ""}`}>
          {cap(listing.status)}
        </span>
        <SellerVerification verified={listing.trader_verified} level={listing.trader_verified_level} />
      </div>

      <div className="flex flex-1 flex-col p-3.5 pt-1.5">
        <div className="flex items-baseline justify-between gap-2">
          <h3 className="text-[15px] font-bold leading-tight">{cap(listing.gemstone_type)}</h3>
          <span className="whitespace-nowrap text-[15px] font-bold">{listing.weight_carats} ct</span>
        </div>
        <div className="mt-2 flex flex-wrap gap-1.5">
          {listing.color && <span className={pill}>{listing.color}</span>}
          <span className={pill}>{cap(listing.treatment)}</span>
          {listing.origin && <span className={pill}>{listing.origin}</span>}
        </div>
        <div className="mt-auto flex items-center gap-1.5 border-t border-border pt-3 text-[13px] text-muted-foreground">
          <span className="truncate font-medium text-foreground">{listing.trader_name}</span>
          <VerifiedBadge verified={listing.trader_verified} />
          {listing.trader_country && (
            <span className="ml-auto flex items-center gap-0.5 whitespace-nowrap">
              <MapPin className="h-3.5 w-3.5" /> {listing.trader_country}
            </span>
          )}
        </div>
      </div>
    </Link>
  );
}