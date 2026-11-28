import React from "react";
import { Link } from "react-router-dom";
import { Image } from "@/components/ui/image";
import { ArrowRight, BadgeCheck, User } from "lucide-react";
import TierBadge from "@/components/common/TierBadge";
import { isVerified } from "@/lib/verification";

/** Horizontal discovery row of traders the viewer hasn't networked with yet. */
export default function SuggestedTraders({ traders }) {
  if (!traders.length) return null;

  return (
    <section className="pb-4">
      <div className="flex items-center justify-between px-4">
        <h2 className="text-[17px] font-bold">Suggested traders</h2>
        <Link to="/gemstones?tab=traders" className="flex items-center gap-1 text-sm font-semibold text-primary">
          See all <ArrowRight className="h-4 w-4" />
        </Link>
      </div>
      <div className="mt-2 flex gap-3 overflow-x-auto px-4 py-1 scrollbar-none fade-x">
        {traders.map((t) => (
          <Link
            key={t.id}
            to={`/trader/${t.id}`}
            className="tap-scale flex w-20 shrink-0 flex-col items-center rounded-lg text-center hover:text-primary"
          >
            <div className="relative h-14 w-14">
              <div className="flex h-full w-full items-center justify-center overflow-hidden rounded-full bg-secondary">
                {t.profile_photo ? (
                  <Image src={t.profile_photo} alt="" className="h-full w-full" />
                ) : (
                  <User className="h-5 w-5 text-muted-foreground" aria-hidden="true" />
                )}
              </div>
              {isVerified(t) && (
                <BadgeCheck
                  aria-label="Verified"
                  className="absolute -bottom-0.5 -right-0.5 h-[18px] w-[18px] rounded-full bg-background text-primary ring-2 ring-background"
                />
              )}
            </div>
            <p className="mt-1.5 w-full truncate text-sm font-semibold leading-tight">{t.full_name}</p>
            <TierBadge tier={t.subscription_tier} className="mt-1" />
          </Link>
        ))}
      </div>
    </section>
  );
}