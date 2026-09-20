import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { base44 } from "@/api/base44Client";
import { Gem, Search } from "lucide-react";
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
      user_email: email,
      subscription_tier: "none",
      // `verified` is deliberately not sent: it is backend-write-only now, so
      // including it here would be rejected. The entity default is already false.
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

  if (!accountType) {
    const options = [
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
    }];

    return (
      <div className="px-4 pt-8 pb-10 max-w-lg mx-auto">
        <img src={LOGO_URL} alt="Gems24" className="w-14 h-14" />
        <h1 className="mt-4 text-[26px] font-bold leading-tight">Welcome to Gems24</h1>
        <p className="mt-1.5 text-sm text-muted-foreground">How would you describe yourself?</p>
        <div className="mt-6 space-y-3">
          {options.map(({ key, icon: Icon, title, desc }) =>
          <button
            key={key}
            onClick={() => setAccountType(key)}
            className="w-full text-left rounded-2xl bg-card p-5 transition-all">
            
              <div className="neu-inset-sm w-11 h-11 rounded-xl bg-background flex items-center justify-center">
                <Icon className="w-5 h-5 text-primary" />
              </div>
              <h3 className="mt-3.5 font-semibold text-lg">{title}</h3>
              <p className="mt-1 text-sm text-muted-foreground">{desc}</p>
            </button>
          )}
        </div>
      </div>);

  }

  return (
    <div className="px-4 pt-6 pb-10 max-w-lg mx-auto">
      <ProfileWizard
        initial={draft || {}}
        accountType={accountType}
        onSave={save}
        saving={saving}
        onExit={() => setAccountType(null)}
        submitLabel={user ? "Create my profile" : "Continue"} />

    </div>);

}