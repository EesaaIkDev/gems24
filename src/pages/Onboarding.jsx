import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { base44 } from "@/api/base44Client";
import { Gem, Search, ArrowLeft } from "lucide-react";
import TraderForm from "@/components/traders/TraderForm";
import Spinner from "@/components/common/Spinner";
import { LOGO_URL } from "@/lib/gems";

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

  // Profile choices are made first and kept locally; the account is only
  // created at the very end, so nobody signs up before building something.
  const save = async (data) => {
    setSaving(true);
    if (!user) {
      localStorage.setItem(DRAFT_KEY, JSON.stringify({ ...data, account_type: accountType }));
      base44.auth.redirectToLogin(window.location.href);
      return;
    }
    await base44.entities.Trader.create({
      ...data,
      account_type: accountType,
      user_email: user.email,
      subscription_tier: "none",
      verified: false,
    });
    localStorage.removeItem(DRAFT_KEY);
    navigate("/profile", { replace: true });
  };

  if (checking) return <Spinner />;

  if (!accountType) {
    const options = [
      {
        key: "trader",
        icon: Gem,
        title: "I'm a Trader",
        desc: "Publish gemstone listings, appear in Gemstones search and connect with traders worldwide.",
      },
      {
        key: "buyer",
        icon: Search,
        title: "I'm a Buyer",
        desc: "Browse stones from verified traders and message them directly.",
      },
    ];
    return (
      <div className="px-4 pt-8 pb-10 max-w-lg mx-auto">
        <img src={LOGO_URL} alt="Gems24" className="w-14 h-14" />
        <h1 className="mt-4 text-[26px] font-bold leading-tight">Welcome to Gems24</h1>
        <p className="mt-1.5 text-sm text-muted-foreground">How will you be using Gems24?</p>
        <div className="mt-6 space-y-3">
          {options.map(({ key, icon: Icon, title, desc }) => (
            <button
              key={key}
              onClick={() => setAccountType(key)}
              className="w-full text-left rounded-2xl bg-card p-5 transition-all"
            >
              <div className="neu-inset-sm w-11 h-11 rounded-xl bg-background flex items-center justify-center">
                <Icon className="w-5 h-5 text-primary" />
              </div>
              <h3 className="mt-3.5 font-semibold text-lg">{title}</h3>
              <p className="mt-1 text-sm text-muted-foreground">{desc}</p>
            </button>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="px-4 pt-6 pb-10 max-w-lg mx-auto">
      <button
        onClick={() => setAccountType(null)}
        className="inline-flex items-center gap-1.5 text-sm text-muted-foreground hover:text-primary"
      >
        <ArrowLeft className="w-4 h-4" /> Back
      </button>
      <h1 className="mt-4 text-[26px] font-bold leading-tight">
        {accountType === "trader" ? "Build your trader profile" : "Set up your buyer profile"}
      </h1>
      <p className="mt-1.5 text-sm text-muted-foreground">
        {user
          ? accountType === "trader"
            ? "This is what other traders and buyers will see."
            : "So traders know who they're speaking with."
          : "Set it up first — we'll only ask for an email at the end to save it."}
      </p>
      <div className="mt-6">
        <TraderForm
          initial={draft || {}}
          onSave={save}
          saving={saving}
          submitLabel={user ? "Create my profile" : "Continue"}
        />
      </div>
    </div>
  );
}