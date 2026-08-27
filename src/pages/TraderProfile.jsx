import React, { useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";
import { base44 } from "@/api/base44Client";
import { Image } from "@/components/ui/image";
import { ArrowLeft, Lock, Mail, MapPin, User } from "lucide-react";
import Spinner from "@/components/common/Spinner";
import LoadError from "@/components/common/LoadError";
import useLoader from "@/hooks/useLoader";
import TierBadge from "@/components/common/TierBadge";
import VerifiedBadge from "@/components/common/VerifiedBadge";
import ListingCard from "@/components/listings/ListingCard";
import NetworkButton from "@/components/chat/NetworkButton";
import useCurrentTrader from "@/hooks/useCurrentTrader";
import { cap } from "@/lib/gems";
import { findConnection, listMyConnections } from "@/lib/network";
import Seo from "@/components/seo/Seo";
import { SITE, absolute } from "@/lib/seo";

export default function TraderProfile() {
  const { id } = useParams();
  const { trader: viewer, loading: viewerLoading } = useCurrentTrader();
  const [connection, setConnection] = useState(undefined);

  const isSelf = viewer?.id === id;

  const loadConnection = async (viewerId) => {
    const rows = await listMyConnections(viewerId);
    setConnection(findConnection(rows, viewerId, id));
  };

  const { data, loading, error, reload } = useLoader(async () => {
    const [t, rows] = await Promise.all([
      base44.entities.Trader.get(id),
      base44.entities.Listing.filter({ trader_id: id }, "-created_date", 100),
    ]);
    return { trader: t, listings: rows };
  }, [id]);

  useEffect(() => {
    if (viewer?.id && !isSelf) loadConnection(viewer.id);
  }, [viewer?.id, id]);

  if (loading) return <Spinner />;
  if (error || !data?.trader)
    return <LoadError title="Profile unavailable" description="This trader may no longer be listed." onRetry={reload} />;

  const { trader, listings } = data;
  const connected = connection?.status === "accepted";
  const showContact = isSelf || connected;
  const active = listings.filter((l) => l.status !== "sold");

  const traderName = trader.business_name || trader.full_name;
  const place = [trader.city, trader.country].filter(Boolean).join(", ");

  return (
    <div className="pb-6">
      {/* Public profile: only the trade-facing details, never contact data. */}
      <Seo
        title={`${traderName} — Gemstone ${trader.account_type === "buyer" ? "Buyer" : "Trader"}${place ? ` in ${place}` : ""} | Gems24`}
        description={`${traderName} on Gems24${place ? `, based in ${place}` : ""}${
          trader.specialties?.length ? `, specialising in ${trader.specialties.slice(0, 3).join(", ")}` : ""
        }. View ${active.length} active gemstone listing${active.length === 1 ? "" : "s"} and connect on Gems24.`}
        canonical={absolute(`/trader/${trader.id}`)}
        image={trader.profile_photo}
        type="profile"
        jsonLd={{
          "@context": "https://schema.org",
          "@type": "ProfilePage",
          url: absolute(`/trader/${trader.id}`),
          mainEntity: {
            "@type": "Organization",
            name: traderName,
            description: trader.bio || undefined,
            image: trader.profile_photo || undefined,
            address: place ? { "@type": "PostalAddress", addressLocality: trader.city, addressCountry: trader.country } : undefined,
            knowsAbout: trader.specialties?.length ? trader.specialties : undefined,
          },
          isPartOf: { "@type": "WebSite", name: SITE.name, url: SITE.url },
        }}
      />
      <div className="px-4 pt-4">
        <Link to="/gemstones" className="inline-flex items-center gap-1.5 text-sm text-muted-foreground hover:text-primary">
          <ArrowLeft className="w-4 h-4" /> Gemstones
        </Link>
      </div>

      <div className="px-4 mt-4">
        <div className="rounded-2xl bg-card border border-border p-5">
          <div className="flex items-start gap-4">
            <div className="w-20 h-20 rounded-2xl overflow-hidden bg-secondary flex items-center justify-center shrink-0">
              {trader.profile_photo ? (
                <Image src={trader.profile_photo} alt={`${traderName}, gemstone trader on Gems24`} className="w-full h-full" />
              ) : (
                <User className="w-8 h-8 text-muted-foreground/50" />
              )}
            </div>
            <div className="min-w-0 flex-1">
              <div className="flex items-center gap-2">
                <h1 className="text-xl font-bold truncate">{trader.full_name}</h1>
                <VerifiedBadge verified={trader.verified} />
              </div>
              {trader.business_name && <p className="text-sm text-muted-foreground">{trader.business_name}</p>}
              <div className="mt-2 flex flex-wrap items-center gap-2">
                <TierBadge tier={trader.subscription_tier} />
                {(trader.city || trader.country) && (
                  <span className="flex items-center gap-1 text-xs text-muted-foreground">
                    <MapPin className="w-3 h-3" /> {[trader.city, trader.country].filter(Boolean).join(", ")}
                  </span>
                )}
                {trader.years_experience ? (
                  <span className="text-xs text-muted-foreground">{trader.years_experience} yrs experience</span>
                ) : null}
              </div>
            </div>
          </div>

          {trader.specialties?.length > 0 && (
            <div className="mt-4 flex flex-wrap gap-1.5">
              {trader.specialties.map((s) => (
                <span key={s} className="rounded-lg bg-accent px-2.5 py-1 text-xs font-medium text-accent-foreground">
                  {cap(s)}
                </span>
              ))}
            </div>
          )}

          {trader.bio && <p className="mt-4 text-[0.9375rem] leading-relaxed text-foreground/85">{trader.bio}</p>}

          <div className="mt-5 rounded-2xl bg-secondary/70 p-4">
            <p className="text-[0.6875rem] uppercase tracking-wider text-muted-foreground font-semibold">Contact details</p>
            {showContact ? (
              <div className="mt-2 space-y-1.5">
                {trader.contact_email && (
                  <a href={`mailto:${trader.contact_email}`} className="flex items-center gap-2 text-sm hover:text-primary">
                    <Mail className="w-4 h-4 text-primary" /> {trader.contact_email}
                  </a>
                )}
                {/* Phone numbers stay private — never shown to other users. */}
                {!trader.contact_email && (
                  <p className="text-sm text-muted-foreground">No contact details added yet.</p>
                )}
              </div>
            ) : (
              <p className="mt-2 flex items-center gap-2 text-sm text-muted-foreground">
                <Lock className="w-4 h-4" /> Visible once you're connected.
              </p>
            )}
          </div>

          {!isSelf && !viewerLoading && viewer && connection !== undefined && (
            <div className="mt-4">
              <NetworkButton
                viewerId={viewer.id}
                other={trader}
                connection={connection}
                context={{ label: `${trader.full_name}'s profile`, path: `/trader/${trader.id}` }}
                className="w-full"
              />
            </div>
          )}
        </div>
      </div>

      <div className="px-4 mt-6 space-y-3">
        <h2 className="text-sm font-semibold uppercase tracking-wider text-muted-foreground">
          Active listings ({active.length})
        </h2>
        {active.length === 0 ? (
          <p className="text-sm text-muted-foreground">No active listings yet.</p>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {active.map((l) => (
              <ListingCard key={l.id} listing={l} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}