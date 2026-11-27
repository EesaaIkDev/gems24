import React from "react";
import { Link } from "react-router-dom";
import { Image } from "@/components/ui/image";
import { Gem } from "lucide-react";
import SellerVerification from "@/components/common/SellerVerification";
import { cap } from "@/lib/gems";
import { listingAlt, listingPath } from "@/lib/seo";

const STATUS = {
  available: "text-primary",
  reserved: "text-amber-700 dark:text-amber-400",
  sold: "text-muted-foreground",
};

const pill = "truncate rounded-full bg-secondary px-2 py-0.5 text-[11px] text-foreground";

/** Compact marketplace tile: photo first, then the facts a buyer scans for. */
export default function ListingCard({ listing }) {
  const photo = listing.photos?.[0];
  const tags = [listing.color, listing.origin].filter(Boolean);
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
      </div>

      <div className="flex flex-1 flex-col p-3">
        <div className="flex items-center gap-2">
          <span className={`text-[11px] font-semibold uppercase tracking-wide ${STATUS[listing.status] || ""}`}>
            {cap(listing.status)}
          </span>
          <SellerVerification compact verified={listing.trader_verified} level={listing.trader_verified_level} />
        </div>
        <div className="mt-1 flex items-baseline justify-between gap-2">
          <h3 className="truncate text-[15px] font-bold leading-tight">{cap(listing.gemstone_type)}</h3>
          <span className="whitespace-nowrap text-[15px] font-bold">{listing.weight_carats} ct</span>
        </div>
        {tags.length > 0 && (
          <div className="mt-2 flex min-w-0 gap-1.5">
            {tags.map((t) => (
              <span key={t} className={pill}>{t}</span>
            ))}
          </div>
        )}
      </div>
    </Link>
  );
}