import React, { useState } from "react";
import { Link } from "react-router-dom";
import { base44 } from "@/api/base44Client";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { SettingsGroup, SettingsRow } from "@/components/settings/SettingsGroup";
import { ArrowLeft, CheckCheck, ChevronRight, Crown, FileText, LogOut, Moon, ShieldCheck } from "lucide-react";
import DeleteAccount from "@/components/settings/DeleteAccount";
import TraderForm from "@/components/traders/TraderForm";
import Spinner from "@/components/common/Spinner";
import SignInPrompt from "@/components/common/SignInPrompt";
import TierBadge from "@/components/common/TierBadge";
import NativeSettings from "@/components/settings/NativeSettings";
import PreferenceSwitch from "@/components/settings/PreferenceSwitch";
import useTheme from "@/hooks/useTheme";
import useCurrentTrader from "@/hooks/useCurrentTrader";
import { TIERS } from "@/lib/gems";
import { renewalLabel } from "@/lib/plan";
import { haptic } from "@/lib/despia";

export default function Settings() {
  const { dark, setDark } = useTheme();
  const { user, trader, loading, reload } = useCurrentTrader();
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);

  const save = async (data) => {
    setSaving(true);
    await base44.entities.Trader.update(trader.id, data);
    await reload();
    haptic("success");
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

      <SettingsGroup title="Appearance">
        <SettingsRow icon={Moon} label="Dark mode" description="Easier on the eyes at the trade show.">
          <Switch aria-label="Dark mode" checked={dark} onCheckedChange={setDark} />
        </SettingsRow>
      </SettingsGroup>

      <NativeSettings />

      {user?.role === "admin" && (
        <SettingsGroup title="Admin">
          <SettingsRow as={Link} to="/admin/verifications" icon={ShieldCheck} label="Verification review" description="AML matches waiting on an admin decision.">
            <ChevronRight className="h-4 w-4 text-muted-foreground" />
          </SettingsRow>
        </SettingsGroup>
      )}

      <SettingsGroup title="Legal">
        <SettingsRow as={Link} to="/terms" icon={FileText} label="Terms of Service">
          <ChevronRight className="h-4 w-4 text-muted-foreground" />
        </SettingsRow>
        <SettingsRow as={Link} to="/privacy" icon={FileText} label="Privacy Policy">
          <ChevronRight className="h-4 w-4 text-muted-foreground" />
        </SettingsRow>
      </SettingsGroup>

      {!user ? (
        <SignInPrompt title="Log in to manage your account" />
      ) : !trader ? (
        <SignInPrompt title="Create your profile" cta="Get started" to="/onboarding" />
      ) : (
        <>
          <div className="rounded-xl bg-card border border-border p-4">
            <div className="flex items-center gap-2">
              <Crown className="w-[18px] h-[18px] text-primary" />
              <p className="text-sm font-medium">Subscription</p>
              <TierBadge tier={trader.subscription_tier} className="ml-auto" />
            </div>
            <p className="mt-1.5 text-xs text-muted-foreground">
              {trader.subscription_tier === "none"
                ? "No active plan — you can browse and enquire, but not publish listings."
                : trader.pending_tier
                  ? `${TIERS[trader.subscription_tier].label} plan active — switching to ${TIERS[trader.pending_tier].label} on ${renewalLabel(trader)}.`
                  : `${TIERS[trader.subscription_tier].label} plan active${trader.plan_renews_at ? ` — renews on ${renewalLabel(trader)}` : ""}.`}
            </p>
            <Button asChild variant="outline" className="mt-3 w-full h-11">
              <Link to="/subscription">{trader.subscription_tier === "none" ? "View plans" : "Change plan"}</Link>
            </Button>
          </div>

          <SettingsGroup title="Privacy">
            <SettingsRow
              icon={CheckCheck}
              label="Read receipts"
              description="Let traders see when you've read their messages. If you turn this off, you also won't see theirs."
            >
            <PreferenceSwitch
              label="Read receipts"
              checked={trader.read_receipts !== false}
              onSave={async (v) => {
                await base44.entities.Trader.update(trader.id, { read_receipts: v });
                await reload();
              }}
            />
            </SettingsRow>
            <SettingsRow
              icon={ShieldCheck}
              label="Approval required"
              description="Every trader must send you a network request and be accepted by you before they can message you or see your contact details. This always applies and can't be turned off."
            />
          </SettingsGroup>

          <div className="rounded-xl bg-card border border-border p-5">
            <h2 className="text-sm font-semibold uppercase tracking-wider text-muted-foreground">Edit profile</h2>
            <p className="mt-1 text-xs text-muted-foreground">
              Everything we store about you is shown here and can be changed at any time.
            </p>
            <div className="mt-4">
              <TraderForm initial={trader} onSave={save} saving={saving} submitLabel="Save changes" />
            </div>
            {saved && <p className="mt-3 text-sm text-primary">Profile updated.</p>}
          </div>

          <Button variant="outline" className="w-full h-12" onClick={() => base44.auth.logout("/")}>
            <LogOut className="w-4 h-4 mr-2" /> Log out
          </Button>

          <DeleteAccount trader={trader} />
        </>
      )}
    </div>
  );
}