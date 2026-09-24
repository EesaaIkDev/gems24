import React from "react";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Crown, EyeOff, UserPlus } from "lucide-react";
import ShareInviteButton from "@/components/referral/ShareInviteButton";
import useReferralCode from "@/hooks/useReferralCode";
import { TIERS, tierRank } from "@/lib/gems";
import { bonusPerReferral, referralsRemaining } from "@/lib/referral";

/**
 * Shown when a trader is out of listing slots: upgrading and inviting a trader
 * sit side by side, with the invite as the one-tap path.
 */
export default function LimitChoice({ trader, active, limit }) {
  const code = useReferralCode(trader);
  const unlock = referralsRemaining(trader) > 0 ? bonusPerReferral(trader) : 0;
  const label = TIERS[trader?.subscription_tier || "none"].label;

  return (
    <div className="mx-auto max-w-sm px-4 py-10 text-center">
      <div className="neu-raised mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-background">
        <EyeOff className="h-6 w-6 text-destructive" />
      </div>
      <h1 className="mt-5 font-heading text-xl font-bold leading-tight">
        {limit > 0 ? `You've used all ${limit} of your listing slots` : "Choose a plan to start listing"}
      </h1>
      <p className="mt-3 text-sm leading-relaxed text-muted-foreground">
        {limit > 0
          ? `${label} shows ${limit} ${limit === 1 ? "stone" : "stones"} at a time. Free up room in one of two ways.`
          : "Posting stones is part of every plan. Pick one to publish your first listing."}
      </p>

      {unlock > 0 && tierRank(trader?.subscription_tier) > 0 && (
        <div className="mt-6 rounded-2xl bg-card p-5 text-left">
          <div className="flex items-center gap-2">
            <UserPlus className="h-4 w-4 text-primary" />
            <h2 className="font-heading font-semibold">Unlock {unlock} more listings</h2>
          </div>
          <p className="mt-1.5 text-xs text-muted-foreground">
            Invite a trader with your code {code || "…"} — free, and it works the moment they join.
          </p>
          <div className="mt-4">
            <ShareInviteButton code={code} label={`Invite a trader — get ${unlock} slots`} />
          </div>
        </div>
      )}

      <div className="mt-3 rounded-2xl bg-card p-5 text-left">
        <div className="flex items-center gap-2">
          <Crown className="h-4 w-4 text-primary" />
          <h2 className="font-heading font-semibold">Upgrade your plan</h2>
        </div>
        <p className="mt-1.5 text-xs text-muted-foreground">
          More slots straight away, plus higher placement in search and feeds.
        </p>
        <Button asChild variant="outline" className="mt-4 h-12 w-full font-semibold">
          <Link to="/subscription">See plans</Link>
        </Button>
      </div>

      <Button asChild variant="ghost" className="mt-2 w-full text-muted-foreground">
        <Link to="/profile">Not now</Link>
      </Button>
    </div>
  );
}