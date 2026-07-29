import React from "react";
import { Link } from "react-router-dom";
import { Image } from "@/components/ui/image";
import { User } from "lucide-react";
import TierBadge from "@/components/common/TierBadge";
import VerifiedBadge from "@/components/common/VerifiedBadge";

/** Horizontal discovery row of traders the viewer hasn't networked with yet. */
export default function SuggestedTraders({ traders }) {
  if (!traders.length) return null;

  return (
    <section className="py-4 border-b border-border">
      <h2 className="px-4 text-xs font-semibold uppercase tracking-wider text-muted-foreground">
        Suggested traders
      </h2>
      <div className="mt-3 flex gap-3 overflow-x-auto px-4 pb-1 scrollbar-none">
        {traders.map((t) => (
          <Link
            key={t.id}
            to={`/trader/${t.id}`}
            className="w-36 shrink-0 rounded-2xl border border-border bg-card p-3 text-center hover:border-primary/40 transition-colors"
          >
            <div className="mx-auto w-14 h-14 rounded-full overflow-hidden bg-secondary flex items-center justify-center">
              {t.profile_photo ? (
                <Image src={t.profile_photo} alt={t.full_name} className="w-full h-full" />
              ) : (
                <User className="w-5 h-5 text-muted-foreground/50" />
              )}
            </div>
            <div className="mt-2 flex items-center justify-center gap-1">
              <p className="text-sm font-semibold truncate">{t.full_name}</p>
              <VerifiedBadge verified={t.verified} />
            </div>
            <p className="text-xs text-muted-foreground truncate">{t.country || t.business_name || ""}</p>
            <div className="mt-2 flex justify-center">
              <TierBadge tier={t.subscription_tier} />
            </div>
          </Link>
        ))}
      </div>
    </section>
  );
}