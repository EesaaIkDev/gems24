import React from "react";
import { Link } from "react-router-dom";
import { Image } from "@/components/ui/image";
import { MapPin, User } from "lucide-react";
import TierBadge from "@/components/common/TierBadge";
import VerifiedBadge from "@/components/common/VerifiedBadge";
import { cap } from "@/lib/gems";

export default function TraderCard({ trader }) {
  const highlight = ["platinum", "gold"].includes(trader.subscription_tier);
  return (
    <Link
      to={`/trader/${trader.id}`}
      className={`block gem-corners gem-card gem-frame transition-colors ${
        highlight ? "gem-frame-primary" : ""
      }`}
    >
      <div className="flex gap-3.5 p-3.5 gem-corners gem-card bg-card">
        <div className="w-16 h-16 shrink-0 rounded-xl overflow-hidden bg-secondary flex items-center justify-center">
          {trader.profile_photo ? (
            <Image src={trader.profile_photo} alt={trader.full_name} className="w-full h-full" />
          ) : (
            <User className="w-6 h-6 text-muted-foreground/50" />
          )}
        </div>
        <div className="min-w-0 flex-1">
          <div className="flex items-start gap-2">
            <div className="min-w-0">
              <div className="flex items-center gap-1.5">
                <h3 className="font-semibold text-[15px] truncate">{trader.full_name}</h3>
                <VerifiedBadge verified={trader.verified} />
              </div>
              {trader.business_name && (
                <p className="text-xs text-muted-foreground truncate">{trader.business_name}</p>
              )}
            </div>
            <TierBadge tier={trader.subscription_tier} className="ml-auto shrink-0" />
          </div>
          <div className="mt-1.5 flex items-center gap-3 text-[11px] text-muted-foreground">
            {(trader.country || trader.city) && (
              <span className="flex items-center gap-1">
                <MapPin className="w-3 h-3" />
                {[trader.city, trader.country].filter(Boolean).join(", ")}
              </span>
            )}
            {trader.years_experience ? <span>{trader.years_experience} yrs exp</span> : null}
          </div>
          {trader.specialties?.length > 0 && (
            <div className="mt-2 flex flex-wrap gap-1">
              {trader.specialties.slice(0, 4).map((s) => (
                <span key={s} className="rounded-md bg-accent px-1.5 py-0.5 text-[10px] font-medium text-accent-foreground">
                  {cap(s)}
                </span>
              ))}
            </div>
          )}
        </div>
      </div>
    </Link>
  );
}