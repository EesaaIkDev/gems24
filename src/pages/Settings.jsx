import React, { useState } from "react";
import { Link } from "react-router-dom";
import { base44 } from "@/api/base44Client";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { ArrowLeft, Crown, LogOut, Moon, ShieldCheck } from "lucide-react";
import TraderForm from "@/components/traders/TraderForm";
import Spinner from "@/components/common/Spinner";
import SignInPrompt from "@/components/common/SignInPrompt";
import TierBadge from "@/components/common/TierBadge";
import NativeSettings from "@/components/settings/NativeSettings";
import useTheme from "@/hooks/useTheme";
import useCurrentTrader from "@/hooks/useCurrentTrader";
import { TIERS } from "@/lib/gems";

export default function Settings() {
  const { dark, setDark } = useTheme();
  const { user, trader, loading, reload } = useCurrentTrader();
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);

  const save = async (data) => {
    setSaving(true);
    await base44.entities.Trader.update(trader.id, data);
    await reload();
    setSaving(false);
    setSaved(true);
  };

  if (loading) return <Spinner />;

  return (
    <div className="px-4 pt-4 pb-10 max-w-lg mx-auto space-y-5">
      <Link to="/profile" className="inline-flex items-center gap-1.5 text-sm text-muted-foreground hover:text-primary">
        <ArrowLeft className="w-4 h-4" /> Profile
      </Link>
      <h1 className="text-[1.625rem] font-bold leading-tight">Settings</h1>

      <div className="rounded-2xl bg-card border border-border p-4 flex items-center gap-3">
        <Moon className="w-[18px] h-[18px] text-primary" />
        <div className="flex-1">
          <p className="text-sm font-medium">Dark mode</p>
          <p className="text-xs text-muted-foreground">Easier on the eyes at the trade show.</p>
        </div>
        <Switch checked={dark} onCheckedChange={setDark} />
      </div>

      <NativeSettings />

      {!user ? (
        <SignInPrompt title="Sign in to manage your account" />
      ) : !trader ? (
        <SignInPrompt title="Create your profile" cta="Get started" to="/onboarding" />
      ) : (
        <>
          <div className="rounded-2xl bg-card border border-border p-4">
            <div className="flex items-center gap-2">
              <Crown className="w-[18px] h-[18px] text-primary" />
              <p className="text-sm font-medium">Subscription</p>
              <TierBadge tier={trader.subscription_tier} className="ml-auto" />
            </div>
            <p className="mt-1.5 text-xs text-muted-foreground">
              {trader.subscription_tier === "none"
                ? "No active plan — you can browse and enquire, but not publish listings."
                : `${TIERS[trader.subscription_tier].label} plan active.`}
            </p>
            <Button asChild variant="outline" className="mt-3 w-full h-11">
              <Link to="/subscription">{trader.subscription_tier === "none" ? "View plans" : "Change plan"}</Link>
            </Button>
          </div>

          <div className="rounded-2xl bg-card border border-border p-4 flex items-center gap-3">
            <ShieldCheck className="w-[18px] h-[18px] text-primary" />
            <div className="flex-1">
              <p className="text-sm font-medium">Require approval before messaging</p>
              <p className="text-xs text-muted-foreground">
                Traders can still follow you, but must be accepted before they can chat.
              </p>
            </div>
            <Switch
              checked={!!trader.require_message_approval}
              onCheckedChange={(v) => save({ require_message_approval: v })}
            />
          </div>

          <div className="rounded-2xl bg-card border border-border p-5">
            <h2 className="text-sm font-semibold uppercase tracking-wider text-muted-foreground">Edit profile</h2>
            <div className="mt-4">
              <TraderForm initial={trader} onSave={save} saving={saving} submitLabel="Save changes" />
            </div>
            {saved && <p className="mt-3 text-sm text-primary">Profile updated.</p>}
          </div>

          <Button variant="outline" className="w-full h-12" onClick={() => base44.auth.logout("/")}>
            <LogOut className="w-4 h-4 mr-2" /> Log out
          </Button>
        </>
      )}
    </div>
  );
}