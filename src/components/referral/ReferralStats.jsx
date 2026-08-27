import React from "react";
import useReferralCode from "@/hooks/useReferralCode";
import { REFERRALS_PER_YEAR, tierRank } from "@/lib/gems";
import { bonusPerReferral, referralsRemaining } from "@/lib/referral";

export default function ReferralStats({ trader }) {
  const code = useReferralCode(trader);
  if (tierRank(trader?.subscription_tier) === 0) return null;
  const left = referralsRemaining(trader);
  const stats = [
    { label: "Your code", value: code || "…" },
    { label: "Invites left", value: left },
    { label: "Bonus listings", value: `+${trader?.referral_bonus_listings || 0}` },
  ];

  return (
    <div className="rounded-2xl bg-card p-5">
      <h2 className="font-heading text-sm font-semibold uppercase tracking-wider text-muted-foreground">
        Referrals
      </h2>
      <div className="mt-4 grid grid-cols-3 gap-2 text-center">
        {stats.map(({ label, value }) => (
          <div key={label} className="neu-inset-sm rounded-xl bg-background px-2 py-3">
            <p className="font-heading text-base font-bold leading-none">{value}</p>
            <p className="mt-1.5 text-[0.6875rem] text-muted-foreground">{label}</p>
          </div>
        ))}
      </div>
      <p className="mt-3 text-xs text-muted-foreground">
        {REFERRALS_PER_YEAR} referrals a year, each worth +{bonusPerReferral(trader)} listings on your
        grade. Listings you earn are yours to keep — only the invite count resets each year.
      </p>
    </div>
  );
}