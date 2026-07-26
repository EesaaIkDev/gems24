import React, { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { CreditCard } from "lucide-react";
import TierCard from "@/components/subscription/TierCard";
import Spinner from "@/components/common/Spinner";
import useCurrentTrader from "@/hooks/useCurrentTrader";
import { LOGO_URL, TIERS, TIER_ORDER } from "@/lib/gems";

const FEATURES = {
  bronze: ["3 active listings", "Public trader profile", "Receive unlimited enquiries", "Trader networking"],
  silver: ["10 active listings", "Highlighted in directory", "Silver badge on profile", "Trader networking"],
  gold: ["30 active listings", "Gold badge on profile & listings", "Higher placement in search", "Priority in directory"],
  platinum: ["Unlimited listings", "Platinum badge", "Top placement everywhere", "Featured spot on home page"],
};

export default function Subscription() {
  const { trader, loading } = useCurrentTrader();
  const [selected, setSelected] = useState(null);

  if (loading) return <Spinner />;

  return (
    <div className="px-4 pt-5 pb-10">
      <div className="text-center max-w-lg mx-auto">
        <img src={LOGO_URL} alt="Gems24" className="w-14 h-14 mx-auto" />
        <h1 className="mt-4 text-[26px] font-bold leading-tight">Choose your plan</h1>
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

      <p className="mt-6 text-center text-xs text-muted-foreground">
        Monthly recurring billing, cancel anytime. Prices shown are placeholders until your final pricing is confirmed.
      </p>

      <Dialog open={!!selected} onOpenChange={() => setSelected(null)}>
        <DialogContent className="sm:max-w-md rounded-2xl">
          <DialogHeader>
            <DialogTitle>{selected ? `${TIERS[selected].label} plan` : ""}</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div className="flex items-center gap-3 rounded-xl bg-secondary/70 p-4">
              <CreditCard className="w-5 h-5 text-primary" />
              <div>
                <p className="text-sm font-semibold">Secure card payment</p>
                <p className="text-xs text-muted-foreground">
                  ${selected ? TIERS[selected].price : 0} per month, billed automatically.
                </p>
              </div>
            </div>
            <p className="text-sm text-muted-foreground">
              Card payments aren't switched on yet. Once Stripe is connected and your final monthly prices are
              confirmed, this button will take you straight to checkout and your plan will activate automatically.
            </p>
            <Button className="w-full h-12 font-semibold" onClick={() => setSelected(null)}>
              Got it
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}