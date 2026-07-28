import React from "react";
import { Link } from "react-router-dom";
import { Image } from "@/components/ui/image";
import { Button } from "@/components/ui/button";
import { ChevronRight, Crown, MessageCircle, Settings as SettingsIcon, Users, User } from "lucide-react";
import Spinner from "@/components/common/Spinner";
import SignInPrompt from "@/components/common/SignInPrompt";
import TierBadge from "@/components/common/TierBadge";
import VerifiedBadge from "@/components/common/VerifiedBadge";
import useCurrentTrader from "@/hooks/useCurrentTrader";
import { TIERS, cap } from "@/lib/gems";

export default function Profile() {
  const { user, trader, loading } = useCurrentTrader();

  if (loading) return <Spinner />;
  if (!user) return <SignInPrompt title="Sign in to Gems24" />;
  if (!trader)
    return <SignInPrompt title="Create your profile" description="Tell us who you are to get started." cta="Get started" to="/onboarding" />;

  const links = [
    { to: `/trader/${trader.id}`, icon: User, label: "View public profile" },
    { to: "/messages", icon: MessageCircle, label: "Messages" },
    { to: "/connections", icon: Users, label: "My connections" },
    { to: "/subscription", icon: Crown, label: "Subscription & upgrade" },
    { to: "/settings", icon: SettingsIcon, label: "Settings" },
  ];

  return (
    <div className="px-4 pt-5 space-y-5 max-w-lg mx-auto">
      <div className="rounded-3xl bg-card border border-border p-5">
        <div className="flex items-center gap-4">
          <div className="w-20 h-20 rounded-2xl overflow-hidden bg-secondary flex items-center justify-center shrink-0">
            {trader.profile_photo ? (
              <Image src={trader.profile_photo} alt={trader.full_name} className="w-full h-full" />
            ) : (
              <User className="w-8 h-8 text-muted-foreground/50" />
            )}
          </div>
          <div className="min-w-0">
            <div className="flex items-center gap-1.5">
              <h1 className="text-xl font-bold truncate">{trader.full_name}</h1>
              <VerifiedBadge verified={trader.verified} />
            </div>
            <p className="text-sm text-muted-foreground truncate">
              {trader.business_name || cap(trader.account_type)}
            </p>
            <div className="mt-1.5 flex items-center gap-2">
              <TierBadge tier={trader.subscription_tier} />
              <span className="text-xs text-muted-foreground">
                {trader.subscription_tier === "none" ? "No active plan" : `${TIERS[trader.subscription_tier].label} plan`}
              </span>
            </div>
          </div>
        </div>
        <Button asChild variant="outline" className="mt-4 w-full h-11">
          <Link to="/settings">Edit profile</Link>
        </Button>
      </div>

      <div className="rounded-2xl bg-card border border-border overflow-hidden divide-y divide-border">
        {links.map(({ to, icon: Icon, label }) => (
          <Link key={to} to={to} className="flex items-center gap-3 px-4 h-14 hover:bg-secondary/60 transition-colors">
            <Icon className="w-[18px] h-[18px] text-primary" />
            <span className="text-sm font-medium">{label}</span>
            <ChevronRight className="w-4 h-4 text-muted-foreground ml-auto" />
          </Link>
        ))}
      </div>
    </div>
  );
}