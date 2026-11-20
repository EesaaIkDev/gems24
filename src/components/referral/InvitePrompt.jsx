import React from "react";
import { UserPlus } from "lucide-react";
import ShareInviteButton from "@/components/referral/ShareInviteButton";
import useReferralCode from "@/hooks/useReferralCode";
import { tierRank } from "@/lib/gems";
import { bonusPerReferral, referralsRemaining } from "@/lib/referral";

/** Ongoing growth nudge — hidden at the bonus cap, and for traders off-plan. */
export default function InvitePrompt({ trader }) {
  const code = useReferralCode(trader);
  const invitesLeft = referralsRemaining(trader);
  const perInvite = bonusPerReferral(trader);
  if (invitesLeft <= 0 || tierRank(trader?.subscription_tier) === 0) return null;

  return (
    <div className="rounded-xl border border-border bg-card p-5">
      <div className="flex items-center gap-3">
        <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-accent text-primary">
          <UserPlus className="h-5 w-5 text-primary" />
        </div>
        <div className="min-w-0">
          <h3 className="font-heading font-semibold leading-tight">
            Invite a trader, unlock {perInvite} more listings
          </h3>
          <p className="mt-0.5 text-xs text-muted-foreground">
            Your code {code || "…"} · {invitesLeft} invite{invitesLeft === 1 ? "" : "s"} left this year
          </p>
        </div>
      </div>
      <div className="mt-4">
        <ShareInviteButton code={code} />
      </div>
    </div>
  );
}