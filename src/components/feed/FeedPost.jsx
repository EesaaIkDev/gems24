import React from "react";
import { Link } from "react-router-dom";
import { Image } from "@/components/ui/image";
import { Gem, MapPin, User } from "lucide-react";
import TierBadge from "@/components/common/TierBadge";
import VerifiedBadge from "@/components/common/VerifiedBadge";
import NetworkButton from "@/components/chat/NetworkButton";
import { cap } from "@/lib/gems";

/** A photo-forward feed post for a single gemstone listing. */
export default function FeedPost({ listing, trader, viewerId, connection }) {
  const photo = listing.photos?.[0];

  return (
    <article className="border-b border-border pb-4">
      <div className="flex items-center gap-3 px-4 py-3">
        <Link to={`/trader/${listing.trader_id}`} className="shrink-0">
          <div className="w-10 h-10 rounded-full overflow-hidden bg-secondary flex items-center justify-center">
            {trader?.profile_photo ? (
              <Image src={trader.profile_photo} alt={trader.full_name} className="w-full h-full" />
            ) : (
              <User className="w-4 h-4 text-muted-foreground/50" />
            )}
          </div>
        </Link>
        <div className="min-w-0 flex-1">
          <div className="flex items-center gap-1.5">
            <Link to={`/trader/${listing.trader_id}`} className="font-semibold text-sm truncate hover:text-primary">
              {trader?.full_name || listing.trader_name}
            </Link>
            <VerifiedBadge verified={listing.trader_verified} />
          </div>
          {(trader?.business_name || listing.trader_country) && (
            <p className="flex items-center gap-1 text-xs text-muted-foreground truncate">
              {listing.trader_country && <MapPin className="w-3 h-3" />}
              {[trader?.business_name, listing.trader_country].filter(Boolean).join(" • ")}
            </p>
          )}
        </div>
        <TierBadge tier={listing.trader_tier} />
      </div>

      <Link to={`/listing/${listing.id}`} className="block bg-secondary">
        <div className="aspect-square w-full flex items-center justify-center">
          {photo ? (
            <Image src={photo} alt={`${listing.weight_carats} ct ${listing.gemstone_type}`} className="w-full h-full" />
          ) : (
            <Gem className="w-10 h-10 text-muted-foreground/40" />
          )}
        </div>
      </Link>

      <div className="px-4 pt-3">
        <Link to={`/listing/${listing.id}`} className="font-semibold text-[0.9375rem] hover:text-primary">
          {listing.weight_carats} ct {cap(listing.gemstone_type)}
        </Link>
        <p className="mt-0.5 text-sm text-muted-foreground">
          {[cap(listing.treatment), listing.color, listing.origin].filter(Boolean).join(" • ")}
        </p>
        {trader && (
          <NetworkButton
            viewerId={viewerId}
            other={trader}
            connection={connection}
            context={{ label: `${listing.weight_carats} ct ${cap(listing.gemstone_type)}`, path: `/listing/${listing.id}` }}
            className="mt-3 w-full h-11"
          />
        )}
      </div>
    </article>
  );
}