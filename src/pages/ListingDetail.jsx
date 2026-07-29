import React, { useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";
import { base44 } from "@/api/base44Client";
import { Image } from "@/components/ui/image";
import { ArrowLeft, FileCheck2, Gem, MapPin, User } from "lucide-react";
import Spinner from "@/components/common/Spinner";
import TierBadge from "@/components/common/TierBadge";
import VerifiedBadge from "@/components/common/VerifiedBadge";
import NetworkButton from "@/components/chat/NetworkButton";
import useCurrentTrader from "@/hooks/useCurrentTrader";
import { cap } from "@/lib/gems";

function Spec({ label, value }) {
  if (!value) return null;
  return (
    <div className="rounded-xl bg-secondary/70 p-3">
      <p className="text-[0.6875rem] uppercase tracking-wider text-muted-foreground">{label}</p>
      <p className="mt-0.5 text-sm font-semibold">{value}</p>
    </div>
  );
}

export default function ListingDetail() {
  const { id } = useParams();
  const { trader: viewer } = useCurrentTrader();
  const [listing, setListing] = useState(null);
  const [owner, setOwner] = useState(null);
  const [active, setActive] = useState(0);

  useEffect(() => {
    base44.entities.Listing.get(id).then(async (l) => {
      setListing(l);
      if (l?.trader_id) setOwner(await base44.entities.Trader.get(l.trader_id).catch(() => null));
    });
  }, [id]);

  if (!listing) return <Spinner />;

  const photos = listing.photos?.length ? listing.photos : [];

  return (
    <div className="pb-6">
      <div className="px-4 pt-4">
        <Link to="/" className="inline-flex items-center gap-1.5 text-sm text-muted-foreground hover:text-primary">
          <ArrowLeft className="w-4 h-4" /> Back
        </Link>
      </div>

      <div className="mt-3 px-4">
        <div className="aspect-[4/3] rounded-2xl overflow-hidden bg-secondary flex items-center justify-center">
          {photos.length ? (
            <Image src={photos[active]} alt={listing.gemstone_type} className="w-full h-full" />
          ) : (
            <Gem className="w-10 h-10 text-muted-foreground/40" />
          )}
        </div>
        {photos.length > 1 && (
          <div className="mt-2.5 flex gap-2 overflow-x-auto scrollbar-none">
            {photos.map((p, i) => (
              <button
                key={p}
                onClick={() => setActive(i)}
                className={`w-16 h-16 shrink-0 rounded-lg overflow-hidden border-2 ${
                  i === active ? "border-primary" : "border-transparent"
                }`}
              >
                <Image src={p} alt="" className="w-full h-full" />
              </button>
            ))}
          </div>
        )}
      </div>

      <div className="px-4 mt-5 space-y-5">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-2xl font-bold">
              {listing.weight_carats} ct {cap(listing.gemstone_type)}
            </h1>
            <TierBadge tier={listing.trader_tier} />
          </div>
          <p className="text-sm text-muted-foreground mt-1">
            {cap(listing.status)} • {cap(listing.treatment)}
            {listing.origin ? ` • ${listing.origin}` : ""}
          </p>
        </div>

        <div className="grid grid-cols-2 gap-2.5">
          <Spec label="Weight" value={`${listing.weight_carats} ct`} />
          <Spec label="Colour" value={listing.color} />
          <Spec label="Treatment" value={cap(listing.treatment)} />
          <Spec label="Origin" value={listing.origin} />
          <Spec label="Certificate" value={listing.certificate_lab} />
          <Spec label="Status" value={cap(listing.status)} />
        </div>

        {listing.certificate_url && (
          <a
            href={listing.certificate_url}
            target="_blank"
            rel="noreferrer"
            className="flex items-center gap-2 rounded-xl border border-border p-3 text-sm font-medium hover:border-primary/40"
          >
            <FileCheck2 className="w-4 h-4 text-primary" /> View certificate
          </a>
        )}

        {listing.description && (
          <div>
            <h2 className="text-sm font-semibold uppercase tracking-wider text-muted-foreground">Description</h2>
            <p className="mt-2 text-[0.9375rem] leading-relaxed text-foreground/85 whitespace-pre-line">
              {listing.description}
            </p>
          </div>
        )}

        {owner && (
          <Link
            to={`/trader/${owner.id}`}
            className="flex items-center gap-3 rounded-2xl bg-card border border-border p-3.5 hover:border-primary/40 transition-colors"
          >
            <div className="w-12 h-12 rounded-xl overflow-hidden bg-secondary flex items-center justify-center shrink-0">
              {owner.profile_photo ? (
                <Image src={owner.profile_photo} alt={owner.full_name} className="w-full h-full" />
              ) : (
                <User className="w-5 h-5 text-muted-foreground/50" />
              )}
            </div>
            <div className="min-w-0">
              <div className="flex items-center gap-1.5">
                <p className="font-semibold truncate">{owner.full_name}</p>
                <VerifiedBadge verified={owner.verified} />
              </div>
              <p className="text-xs text-muted-foreground truncate">
                {owner.business_name}
                {owner.country ? ` • ${owner.country}` : ""}
              </p>
            </div>
            <TierBadge tier={owner.subscription_tier} className="ml-auto" />
          </Link>
        )}

        {(owner?.country || owner?.city) && (
          <p className="flex items-center gap-1.5 text-xs text-muted-foreground">
            <MapPin className="w-3.5 h-3.5" /> {[owner.city, owner.country].filter(Boolean).join(", ")}
          </p>
        )}
      </div>

      {viewer && owner && viewer.id !== owner.id && (
        <div className="fixed bottom-16 inset-x-0 z-30 px-4 pb-3 pt-3 bg-gradient-to-t from-background via-background to-transparent">
          <div className="max-w-6xl mx-auto">
            <NetworkButton
              viewerId={viewer.id}
              other={owner}
              context={{
                label: `${listing.weight_carats} ct ${cap(listing.gemstone_type)}`,
                path: `/listing/${listing.id}`,
              }}
              className="w-full h-13 py-3.5 text-base rounded-xl"
            />
          </div>
        </div>
      )}
    </div>
  );
}