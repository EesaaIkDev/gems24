import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import BottomSheet from "@/components/ui/bottom-sheet";
import { Button } from "@/components/ui/button";
import { Smartphone, Settings2 } from "lucide-react";
import TierCard from "@/components/subscription/TierCard";
import Spinner from "@/components/common/Spinner";
import useCurrentTrader from "@/hooks/useCurrentTrader";
import useEntitlements from "@/hooks/useEntitlements";
import { isNative, haptic } from "@/lib/despia";
import { launchPaywall, openCustomerCenter } from "@/lib/revenuecat";
import { LOGO_URL, TIERS, TIER_ORDER } from "@/lib/gems";

const FEATURES = {
  bronze: ["3 active listings", "Public trader profile", "Receive unlimited enquiries", "Trader networking"],
  silver: ["10 active listings", "Highlighted in directory", "Silver badge on profile", "Trader networking"],
  gold: ["30 active listings", "Gold badge on profile & listings", "Higher placement in search", "Priority in directory"],
  platinum: ["Unlimited listings", "Platinum badge", "Top placement everywhere", "Featured spot on home page"],
};

export default function Subscription() {
  const navigate = useNavigate();
  const { user, trader, loading, reload } = useCurrentTrader();
  useEntitlements(trader, reload);
  const [selected, setSelected] = useState(null);

  const subscribe = () => {
    haptic("light");
    launchPaywall(selected, trader.id);
    setSelected(null);
  };

  if (loading) return <Spinner />;

  return (
    <div className="px-4 pt-5 pb-10">
      <div className="text-center max-w-lg mx-auto">
        <img src={LOGO_URL} alt="Gems24" className="w-14 h-14 mx-auto" />
        <h1 className="mt-4 text-[1.625rem] font-bold leading-tight">Choose your plan</h1>
        <p className="mt-1.5 text-sm text-muted-foreground">
          Publishing listings requires a paid plan. Higher tiers get badges and better placement.
        </p>
      </div>

      <div className="mt-7 grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4">
        {TIER_ORDER.map((t) => (
          <TierCard
            key={t}
            tier={t}
            features={FEATURES[t]}
            current={trader?.subscription_tier === t}
            onSelect={setSelected}
          />
        ))}
      </div>

      {isNative && trader?.subscription_tier !== "none" && (
        <Button
          variant="outline"
          className="mt-6 w-full max-w-sm mx-auto flex h-12"
          onClick={() => openCustomerCenter(trader.id)}
        >
          <Settings2 className="w-4 h-4 mr-2" /> Manage subscription
        </Button>
      )}

      <p className="mt-6 text-center text-xs text-muted-foreground">
        Billed through your {isNative ? "app store" : "App Store or Google Play"} account. Cancel anytime.
      </p>

      <BottomSheet
        open={!!selected}
        onOpenChange={(o) => !o && setSelected(null)}
        title={selected ? `${TIERS[selected].label} plan` : ""}
      >
        <div className="mx-auto max-w-md space-y-4">
...
        </div>
      </BottomSheet>
    </div>
  );
}