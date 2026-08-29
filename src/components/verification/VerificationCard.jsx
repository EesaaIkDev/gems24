import React, { useState } from "react";
import { BadgeCheck, ShieldCheck } from "lucide-react";
import { Button } from "@/components/ui/button";
import BottomSheet from "@/components/ui/bottom-sheet";
import SuccessSplash from "@/components/subscription/SuccessSplash";
import LicenseUpload from "./LicenseUpload";

const POINTS = [
  "A verified badge on your profile and on every stone you list",
  "Buyers and traders open verified profiles first",
  "Only your license is checked — it is never stored or shared",
];

/** Gem License verification, given its own standing on the profile. */
export default function VerificationCard({ trader, onVerified }) {
  const [open, setOpen] = useState(false);
  const [splash, setSplash] = useState(false);

  const finish = async () => {
    setOpen(false);
    setSplash(true);
    await onVerified();
  };

  if (trader.verified) {
    return (
      <div className="rounded-2xl border border-primary/30 bg-card p-4">
        <div className="flex items-center gap-2.5">
          <BadgeCheck className="h-[18px] w-[18px] text-primary" />
          <p className="text-sm font-semibold">Verified trader</p>
        </div>
        <p className="mt-1.5 text-xs leading-relaxed text-muted-foreground">
          Your Gem License has been checked. The verified badge travels with your profile and every
          stone you list.
        </p>
      </div>
    );
  }

  return (
    <>
      <div className="rounded-2xl border border-primary/30 bg-card p-5">
        <div className="flex items-center gap-2.5">
          <ShieldCheck className="h-[18px] w-[18px] text-primary" />
          <h2 className="text-sm font-semibold">Get verified</h2>
          <span className="ml-auto text-[0.625rem] font-bold uppercase tracking-wider text-primary">
            Not verified
          </span>
        </div>
        <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
          This trade runs on proof. Verify your Gem License once and the network knows you're the real
          thing.
        </p>
        <ul className="mt-3 space-y-1.5">
          {POINTS.map((p) => (
            <li key={p} className="flex gap-2 text-xs leading-relaxed text-foreground/80">
              <BadgeCheck className="mt-0.5 h-3.5 w-3.5 shrink-0 text-primary" />
              {p}
            </li>
          ))}
        </ul>
        <Button className="mt-4 h-11 w-full" onClick={() => setOpen(true)}>
          Verify my license
        </Button>
      </div>

      <BottomSheet open={open} onOpenChange={setOpen} title="Gem License verification">
        <LicenseUpload trader={trader} onDone={finish} />
      </BottomSheet>

      {splash && (
        <SuccessSplash
          title="You're a verified trader"
          subtitle="Your badge is live across the network — on your profile and on every stone you list."
          onDone={() => setSplash(false)}
        />
      )}
    </>
  );
}