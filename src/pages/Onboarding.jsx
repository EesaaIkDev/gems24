import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { base44 } from "@/api/base44Client";
import { ArrowLeft, Building2, Gem, Search, User } from "lucide-react";
import { haptic } from "@/lib/despia";
import ProfileWizard from "@/components/traders/ProfileWizard";
import Spinner from "@/components/common/Spinner";
import AttributionStep from "@/components/referral/AttributionStep";
import SignupStep from "@/components/traders/SignupStep";
import { LOGO_URL } from "@/lib/gems";
import {
  clearPendingReferralCode,
  newTraderReferralFields,
  redeemReferralCode,
} from "@/lib/referral";

const DRAFT_KEY = "gems24_profile_draft";

const readDraft = () => {
  try {
    return JSON.parse(localStorage.getItem(DRAFT_KEY) || "null");
  } catch {
    return null;
  }
};

export default function Onboarding() {
  const navigate = useNavigate();
  const [user, setUser] = useState(null);
  const [checking, setChecking] = useState(true);
  const [draft, setDraft] = useState(null);
  const [accountType, setAccountType] = useState(null);
  const [traderKind, setTraderKind] = useState(null);
  const [saving, setSaving] = useState(false);
  const [attribution, setAttribution] = useState(null);
  const [pendingProfile, setPendingProfile] = useState(null);

  useEffect(() => {
    (async () => {
      let me = null;
      try {
        me = await base44.auth.me();
      } catch {
        me = null;
      }
      setUser(me);
      const saved = readDraft();
      if (saved) {
        setDraft(saved);
        setAccountType(saved.account_type || null);
        setTraderKind(saved.trader_kind || null);
        if (saved.signup_source)
          setAttribution({ source: saved.signup_source, code: saved.referral_code_entered || "" });
      }
      if (me) {
        const rows = await base44.entities.Trader.filter({ user_email: me.email });
        if (rows[0]) {
          localStorage.removeItem(DRAFT_KEY);
          return navigate("/profile", { replace: true });
        }
      }
      setChecking(false);
    })();
  }, [navigate]);

  // Profile choices are made first and kept locally; guests then verify their
  // email right here, and the account plus profile are created on the spot.
  const save = async (data) => {
    if (!user) {
      localStorage.setItem(
        DRAFT_KEY,
        JSON.stringify({
          ...data,
          account_type: accountType,
          trader_kind: traderKind,
          signup_source: attribution?.source || "",
          referral_code_entered: attribution?.code || ""
        })
      );
      setPendingProfile(data);
      return;
    }
    setSaving(true);
    await createProfile(data, user.email);
    navigate("/profile", { replace: true });
  };

  const createProfile = async (data, email) => {
    await base44.entities.Trader.create({
      ...data,
      ...newTraderReferralFields(),
      account_type: accountType,
      ...(accountType === "trader" ? { trader_kind: traderKind === "business" ? "business" : "individual" } : {}),
      user_email: email,
      // `verified`, `subscription_tier` and the referral counters are
      // deliberately not sent: they are backend-write-only, so including them
      // would be rejected. The entity defaults already apply.
      signup_source: attribution?.source || ""
    });
    // Email is verified by this point, so the referrer's bonus lands now.
    if (attribution?.code) await redeemReferralCode(attribution.code);
    clearPendingReferralCode();
    localStorage.removeItem(DRAFT_KEY);
  };

  // Fresh token: hard-redirect so the auth provider re-initialises.
  const finishSignup = async (email) => {
    setSaving(true);
    await createProfile(pendingProfile, email);
    window.location.href = "/profile";
  };

  if (checking) return <Spinner />;

  if (pendingProfile)
    return (
      <div className="px-4 pt-8 pb-10 max-w-lg mx-auto">
        <SignupStep onVerified={finishSignup} onBack={() => setPendingProfile(null)} working={saving} />
      </div>);

  if (!attribution)
    return (
      <div className="px-4 pt-8 pb-10 max-w-lg mx-auto">
        <AttributionStep onDone={setAttribution} />
      </div>);

  if (!accountType)
    return (
      <Chooser
        title="Welcome to Gems24"
        subtitle="How would you describe yourself?"
        onPick={setAccountType}
        options={[
          {
            key: "trader",
            icon: Gem,
            title: "I'm a Trader",
            desc: "Publish gemstone listings, appear in Gemstones search and connect with traders worldwide."
          },
          {
            key: "buyer",
            icon: Search,
            title: "I'm a Buyer",
            desc: "Browse stones from verified traders and message them directly."
          }]
        } />);

  if (accountType === "trader" && !traderKind)
    return (
      <Chooser
        title="How do you trade?"
        subtitle="This shapes your profile and which plans you can choose."
        onBack={() => setAccountType(null)}
        onPick={setTraderKind}
        options={[
          {
            key: "individual",
            icon: User,
            title: "Individual trader",
            desc: "You buy and sell stones yourself. Plans go up to Gold, the highest plan for traders."
          },
          {
            key: "business",
            icon: Building2,
            title: "Business",
            desc: "A registered gem house, exporter or wholesaler. Get a company profile and the Platinum business plan."
          }]
        } />);

  return (
    <div className="px-4 pt-6 pb-10 max-w-lg mx-auto">
      <ProfileWizard
        initial={draft || {}}
        accountType={accountType}
        traderKind={traderKind}
        onSave={save}
        saving={saving}
        onExit={() => (accountType === "trader" ? setTraderKind(null) : setAccountType(null))}
        submitLabel={user ? "Create my profile" : "Continue"} />

    </div>);

}
function Chooser({ title, subtitle, options, onPick, onBack }) {
  return (
    <div className="px-4 pt-8 pb-10 max-w-lg mx-auto">
      {onBack ? (
        <button onClick={onBack} className="inline-flex items-center gap-1.5 text-sm text-muted-foreground hover:text-primary">
          <ArrowLeft className="h-4 w-4" /> Back
        </button>
      ) : (
        <img src={LOGO_URL} alt="Gems24" className="w-14 h-14" />
      )}
      <h1 className="mt-4 text-[26px] font-bold leading-tight">{title}</h1>
      <p className="mt-1.5 text-sm text-muted-foreground">{subtitle}</p>
      <div className="mt-6 space-y-3">
        {options.map(({ key, icon: Icon, title: label, desc }) => (
          <button
            key={key}
            onClick={() => {
              haptic("light");
              onPick(key);
            }}
            className="w-full text-left rounded-2xl bg-card p-5 transition-all"
          >
            <div className="neu-inset-sm w-11 h-11 rounded-xl bg-background flex items-center justify-center">
              <Icon className="w-5 h-5 text-primary" />
            </div>
            <h3 className="mt-3.5 font-semibold text-lg">{label}</h3>
            <p className="mt-1 text-sm text-muted-foreground">{desc}</p>
          </button>
        ))}
      </div>
    </div>
  );
}
