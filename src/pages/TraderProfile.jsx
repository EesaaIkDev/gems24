import React, { useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";
import { base44 } from "@/api/base44Client";
import { Image } from "@/components/ui/image";
import { Button } from "@/components/ui/button";
import { ArrowLeft, Lock, Mail, MapPin, Phone, User, UserPlus, Check, Clock } from "lucide-react";
import Spinner from "@/components/common/Spinner";
import TierBadge from "@/components/common/TierBadge";
import VerifiedBadge from "@/components/common/VerifiedBadge";
import ListingCard from "@/components/listings/ListingCard";
import NetworkButton from "@/components/chat/NetworkButton";
import useCurrentTrader from "@/hooks/useCurrentTrader";
import { cap } from "@/lib/gems";

export default function TraderProfile() {
  const { id } = useParams();
  const { trader: viewer, loading: viewerLoading } = useCurrentTrader();
  const [trader, setTrader] = useState(null);
  const [listings, setListings] = useState([]);
  const [connection, setConnection] = useState(null);
  const [busy, setBusy] = useState(false);

  const isSelf = viewer?.id === id;

  const loadConnection = async (viewerId) => {
    const all = await base44.entities.Connection.list("-created_date", 200);
    setConnection(
      all.find(
        (c) =>
          (c.requester_id === viewerId && c.recipient_id === id) ||
          (c.recipient_id === viewerId && c.requester_id === id)
      ) || null
    );
  };

  useEffect(() => {
    base44.entities.Trader.get(id).then(setTrader);
    base44.entities.Listing.filter({ trader_id: id }, "-created_date", 100).then(setListings);
  }, [id]);

  useEffect(() => {
    if (viewer?.id && !isSelf) loadConnection(viewer.id);
  }, [viewer?.id, id]);

  const connect = async () => {
    setBusy(true);
    await base44.entities.Connection.create({ requester_id: viewer.id, recipient_id: id, status: "pending" });
    await loadConnection(viewer.id);
    setBusy(false);
  };

  if (!trader) return <Spinner />;

  const connected = connection?.status === "accepted";
  const showContact = isSelf || connected;
  const active = listings.filter((l) => l.status !== "sold");

  return (
    <div className="pb-6">
      <div className="px-4 pt-4">
        <Link to="/directory" className="inline-flex items-center gap-1.5 text-sm text-muted-foreground hover:text-primary">
          <ArrowLeft className="w-4 h-4" /> Directory
        </Link>
      </div>

      <div className="px-4 mt-4">
        <div className="rounded-3xl bg-card border border-border p-5">
          <div className="flex items-start gap-4">
            <div className="w-20 h-20 rounded-2xl overflow-hidden bg-secondary flex items-center justify-center shrink-0">
              {trader.profile_photo ? (
                <Image src={trader.profile_photo} alt={trader.full_name} className="w-full h-full" />
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
                {trader.phone && (
                  <a href={`tel:${trader.phone}`} className="flex items-center gap-2 text-sm hover:text-primary">
                    <Phone className="w-4 h-4 text-primary" /> {trader.phone}
                  </a>
                )}
                {!trader.contact_email && !trader.phone && (
                  <p className="text-sm text-muted-foreground">No contact details added yet.</p>
                )}
              </div>
            ) : (
              <p className="mt-2 flex items-center gap-2 text-sm text-muted-foreground">
                <Lock className="w-4 h-4" /> Visible once you're connected.
              </p>
            )}
          </div>

          {!isSelf && !viewerLoading && viewer && (
            <div className="mt-4 space-y-2.5">
              <NetworkButton
                viewerId={viewer.id}
                otherId={trader.id}
                context={{ label: `${trader.full_name}'s profile`, path: `/trader/${trader.id}` }}
                className="w-full h-12"
              />
              {connected ? (
                <Button variant="outline" className="w-full h-12" disabled>
                  <Check className="w-4 h-4 mr-2" /> Connected
                </Button>
              ) : connection?.status === "pending" ? (
                <Button variant="outline" className="w-full h-12" disabled>
                  <Clock className="w-4 h-4 mr-2" /> Request pending
                </Button>
              ) : (
                <Button className="w-full h-12 font-semibold" onClick={connect} disabled={busy}>
                  <UserPlus className="w-4 h-4 mr-2" /> Connect
                </Button>
              )}
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