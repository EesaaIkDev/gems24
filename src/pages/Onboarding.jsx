import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { base44 } from "@/api/base44Client";
import { Button } from "@/components/ui/button";
import { Gem, Search, ArrowLeft } from "lucide-react";
import TraderForm from "@/components/traders/TraderForm";
import Spinner from "@/components/common/Spinner";
import { LOGO_URL } from "@/lib/gems";

export default function Onboarding() {
  const navigate = useNavigate();
  const [user, setUser] = useState(null);
  const [checking, setChecking] = useState(true);
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
      if (me) {
        const rows = await base44.entities.Trader.filter({ user_email: me.email });
        if (rows[0]) return navigate("/profile", { replace: true });
      }
      setChecking(false);
    })();
  }, [navigate]);

  const save = async (data) => {
    setSaving(true);
    await base44.entities.Trader.create({
      ...data,
      account_type: accountType,
      user_email: user.email,
      subscription_tier: "none",
      verified: false,
    });
    navigate("/profile", { replace: true });
  };

  if (checking) return <Spinner />;

  if (!user) {
    return (
      <div className="px-6 py-20 text-center">
        <img src={LOGO_URL} alt="Gems24" className="w-20 h-20 mx-auto" />
        <h1 className="mt-5 text-2xl font-bold">Join Gems24</h1>
        <p className="mt-2 text-sm text-muted-foreground max-w-sm mx-auto">
          Create your account to list gemstones, send enquiries and build your trading network.
        </p>
        <Button className="mt-7 h-12 px-8 font-semibold" onClick={() => base44.auth.redirectToLogin()}>
          Sign up / Sign in
        </Button>
      </div>
    );
  }

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
        desc: "Browse stones from verified traders and send enquiries directly.",
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
              className="w-full text-left rounded-2xl bg-card border border-border p-5 hover:border-primary hover:shadow-md transition-all"
            >
              <div className="w-11 h-11 rounded-xl bg-primary/10 flex items-center justify-center">
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
        {accountType === "trader" ? "Create your trader profile" : "Set up your buyer profile"}
      </h1>
      <p className="mt-1.5 text-sm text-muted-foreground">
        {accountType === "trader"
          ? "This is what other traders and buyers will see."
          : "So traders know who they're speaking with."}
      </p>
      <div className="mt-6">
        <TraderForm onSave={save} saving={saving} submitLabel="Create profile" />
      </div>
    </div>
  );
}