import React from "react";
import { Link } from "react-router-dom";
import { Image } from "@/components/ui/image";
import { Gem } from "lucide-react";
import { cap } from "@/lib/gems";

/** Instagram-style grid of a trader's own listings, each tappable to edit. */
export default function OwnListingsGrid({ listings }) {
  return (
    <div className="grid grid-cols-3 gap-1">
      {listings.map((l) => (
        <Link
          key={l.id}
          to={`/my-listings/${l.id}/edit`}
          className="relative aspect-square gem-corners gem-tile bg-secondary flex items-center justify-center overflow-hidden"
        >
          {l.photos?.[0] ? (
            <Image src={l.photos[0]} alt={`${l.weight_carats} ct ${l.gemstone_type}`} className="w-full h-full" />
          ) : (
            <Gem className="w-6 h-6 text-muted-foreground/40" />
          )}
          <span className="absolute inset-x-0 bottom-0 bg-black/45 px-1.5 py-1 text-[0.625rem] font-medium text-white truncate">
            {l.weight_carats} ct {cap(l.gemstone_type)}
            {l.status !== "available" ? ` • ${cap(l.status)}` : ""}
          </span>
        </Link>
      ))}
    </div>
  );
}