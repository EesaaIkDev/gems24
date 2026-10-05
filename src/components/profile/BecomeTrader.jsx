import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { BadgeCheck, Gem, Loader2 } from "lucide-react";
import { base44 } from "@/api/base44Client";
import { Button } from "@/components/ui/button";
import BottomSheet from "@/components/ui/bottom-sheet";
import useOnline from "@/hooks/useOnline";
import { haptic } from "@/lib/despia";
import { isVerified } from "@/lib/verification";

const POINTS = [
  "Publish gemstone listings with a trading plan",
  "Appear in Gemstones search and the trader directory",
  "Your profile, network and chats stay as they are",
];

/** One-way buyer → trader switch, shown to buyers on their profile. */
export default function BecomeTrader({ trader, onUpgraded }) {
  const navigate = useNavigate();
  const online = useOnline();
  const [open, setOpen] = useState(false);
  const [working, setWorking] = useState(false);
  const [error, setError] = useState("");

  const confirm = async () => {
    setError("");
    setWorking(true);
    try {
      const res = await base44.functions["upgradeToTrader"]({});
      if (res?.state === "upgraded" || res?.state === "already_trader") {
        haptic("success");
        setOpen(false);
        await onUpgraded();
        navigate("/subscription");
        return;
      }
      setError("Something went wrong — please try again.");
    } catch {
      setError("Could not switch your account. Please try again.");
    } finally {
      setWorking(false);
    }
  };

  return (
    <>
      <div className="rounded-2xl border border-primary/30 bg-card p-5">
        <div className="flex items-center gap-2.5">
          <Gem className="h-[18px] w-[18px] text-primary" />
          <h2 className="text-sm font-semibold">Start selling on Gems24</h2>
        </div>
        <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
          Switch to a trader account to publish your stones and reach the whole network.
        </p>
        <Button className="mt-4 h-11 w-full" onClick={() => setOpen(true)}>
          Switch to a trader account
        </Button>
      </div>

      <BottomSheet open={open} onOpenChange={setOpen} title="Switch to a trader account">
        <div className="mx-auto max-w-md space-y-4 pb-2">
          <ul className="space-y-1.5">
            {POINTS.map((p) => (
              <li key={p} className="flex gap-2 text-xs leading-relaxed text-foreground/80">
                <BadgeCheck className="mt-0.5 h-3.5 w-3.5 shrink-0 text-primary" />
                {p}
              </li>
            ))}
          </ul>

          {isVerified(trader) && (
            <p className="text-xs leading-relaxed text-muted-foreground">
              Your verified badge will be removed — trader accounts verify with a Gem License instead.
            </p>
          )}

          <p className="text-xs leading-relaxed text-muted-foreground">
            This can't be undone — you can't switch back to a buyer account.
          </p>

          {error && <p className="text-sm text-destructive">{error}</p>}

          <div className="space-y-2">
            <Button className="h-11 w-full" onClick={confirm} disabled={working || !online}>
              {working && <Loader2 className="w-4 h-4 animate-spin" />}
              {!online ? "Unavailable offline" : "Confirm switch"}
            </Button>
            <Button variant="outline" className="h-11 w-full" onClick={() => setOpen(false)} disabled={working}>
              Cancel
            </Button>
          </div>
        </div>
      </BottomSheet>
    </>
  );
}
