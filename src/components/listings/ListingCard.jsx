import React from "react";
import { Link } from "react-router-dom";
import { Image } from "@/components/ui/image";
import { Gem, MapPin } from "lucide-react";
import TierBadge from "@/components/common/TierBadge";
import VerifiedBadge from "@/components/common/VerifiedBadge";
import { cap } from "@/lib/gems";

const STATUS = {
  available: "text-primary",
  reserved: "text-amber-600 dark:text-amber-400",
  sold: "text-muted-foreground",
};

export default function ListingCard({ listing }) {
  const photo = listing.photos?.[0];
  return (
    <Link
      to={`/listing/${listing.id}`}
      className="group neu-raised flex h-full gem-corners gem-card bg-background"
    >
      <div className="flex flex-col w-full gem-corners gem-card overflow-hidden bg-background">
      <div className="relative aspect-[4/3] bg-secondary overflow-hidden">
        {photo ? (
          <Image
            src={photo}
            alt={listing.gemstone_type}
            className="w-full h-full group-hover:scale-[1.04] transition-transform duration-500"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center">
            <Gem className="w-8 h-8 text-muted-foreground/40" />
          </div>
        )}
        <div className="absolute top-2.5 left-2.5 flex gap-1.5">
          <span className={`neu-raised-xs rounded-full px-2.5 py-0.5 text-[10px] font-bold uppercase tracking-wide bg-background ${STATUS[listing.status] || ""}`}>
            {cap(listing.status)}
          </span>
        </div>
        {listing.trader_tier && listing.trader_tier !== "none" && (
          <div className="absolute top-2.5 right-2.5">
            <TierBadge tier={listing.trader_tier} />
          </div>
        )}
      </div>

      <div className="flex-1 flex flex-col p-3.5">
        <div className="flex items-baseline justify-between gap-2">
          <h3 className="font-semibold text-[15px] leading-tight">{cap(listing.gemstone_type)}</h3>
          <span className="text-sm font-bold text-primary whitespace-nowrap">{listing.weight_carats} ct</span>
        </div>
        <div className="mt-2 flex flex-wrap gap-1.5">
          {listing.color && (
            <span className="neu-inset-sm rounded-full bg-background px-2.5 py-1 text-[11px] font-medium text-foreground">{listing.color}</span>
          )}
          <span className="neu-inset-sm rounded-full bg-background px-2.5 py-1 text-[11px] font-medium text-foreground">{cap(listing.treatment)}</span>
          {listing.origin && (
            <span className="neu-inset-sm rounded-full bg-background px-2.5 py-1 text-[11px] font-medium text-foreground">{listing.origin}</span>
          )}
        </div>
        <div className="mt-auto pt-3 border-t border-border flex items-center gap-1.5 text-xs text-muted-foreground">
          <span className="truncate font-medium text-foreground">{listing.trader_name}</span>
          <VerifiedBadge verified={listing.trader_verified} />
          {listing.trader_country && (
            <span className="ml-auto flex items-center gap-0.5 whitespace-nowrap">
              <MapPin className="w-3 h-3" /> {listing.trader_country}
            </span>
          )}
        </div>
        </div>
      </div>
    </Link>
  );
}