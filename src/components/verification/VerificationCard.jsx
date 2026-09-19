import React, { useEffect, useState } from "react";
import { BadgeCheck, Clock, ShieldCheck } from "lucide-react";
import { Button } from "@/components/ui/button";
import BottomSheet from "@/components/ui/bottom-sheet";
import SuccessSplash from "@/components/subscription/SuccessSplash";
import { base44 } from "@/api/base44Client";
import { STATUS, isAwaitingDecision } from "@/lib/verification";
import LicenseUpload from "./LicenseUpload";

const POINTS = [
  "A verified badge on your profile and on every stone you list",
  "Buyers and traders open verified profiles first",
  "Only your license is checked — it is never stored or shared",
];

const BUYER_POINTS = [
  "A verified badge on your buyer profile",
  "Traders prioritise enquiries from verified buyers",
  "Only your document is checked — it is never stored or shared",
];

// Decisions arrive asynchronously, so the celebration is tied to the approval
// landing rather than to the trader pressing submit. This marks it as shown so
// the splash fires once, not on every profile visit afterwards.
const SPLASH_KEY = "gems24_verification_celebrated";

/** Gem License verification, given its own standing on the profile. */
export default function VerificationCard({ trader, onVerified }) {
  const [open, setOpen] = useState(false);
  const [splash, setSplash] = useState(false);
  const [status, setStatus] = useState(null);
  const isBuyer = trader.account_type === "buyer";

  useEffect(() => {
    let cancelled = false;
    base44.entities.Verification.filter({ trader_id: trader.id })
      .then((rows) => {
        if (!cancelled) setStatus(rows?.[0]?.status || STATUS.NONE);
      })
      .catch(() => {
        if (!cancelled) setStatus(STATUS.NONE);
      });
    return () => {
      cancelled = true;
    };
  }, [trader.id, trader.verified]);

  useEffect(() => {
    if (!trader.verified) return;
    if (localStorage.getItem(SPLASH_KEY) === trader.id) return;
    localStorage.setItem(SPLASH_KEY, trader.id);
    setSplash(true);
  }, [trader.verified, trader.id]);

  const finish = async () => {
    setOpen(false);
    await onVerified();
  };

  if (trader.verified) {
    return (
      <>
        <div className="rounded-2xl border border-primary/30 bg-card p-4">
          <div className="flex items-center gap-2.5">
            <BadgeCheck className="h-[18px] w-[18px] text-primary" />
            <p className="text-sm font-semibold">{isBuyer ? "Verified buyer" : "Verified trader"}</p>
          </div>
          <p className="mt-1.5 text-xs leading-relaxed text-muted-foreground">
            {isBuyer
              ? "Your identity has been checked. The verified badge travels with your buyer profile."
              : "Your Gem License has been checked. The verified badge travels with your profile and every stone you list."}
          </p>
        </div>

        {splash && (
          <SuccessSplash
            title={isBuyer ? "You're a verified buyer" : "You're a verified trader"}
            subtitle={
              isBuyer
                ? "Your badge is live across the network — traders can see you're a genuine buyer."
                : "Your badge is live across the network — on your profile and on every stone you list."
            }
            onDone={() => setSplash(false)}
          />
        )}
      </>
    );
  }

  const waiting = isAwaitingDecision(status);

  return (
    <>
      <div className="rounded-2xl border border-primary/30 bg-card p-5">
        <div className="flex items-center gap-2.5">
          {waiting ? (
            <Clock className="h-[18px] w-[18px] text-primary" />
          ) : (
            <ShieldCheck className="h-[18px] w-[18px] text-primary" />
          )}
          <h2 className="text-sm font-semibold">{waiting ? "Verification in progress" : "Get verified"}</h2>
          <span className="ml-auto text-[0.625rem] font-bold uppercase tracking-wider text-primary">
            {waiting ? "Checking" : "Not verified"}
          </span>
        </div>
        <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
          {waiting
            ? "Your documents are with our verification partner. Your badge appears here automatically once the check clears."
            : isBuyer
              ? "Trusted buyers get answered first. Verify your identity once and traders know they're dealing with a genuine buyer."
              : "This trade runs on proof. Verify your Gem License once and the network knows you're the real thing."}
        </p>
        {!waiting && (
          <ul className="mt-3 space-y-1.5">
            {(isBuyer ? BUYER_POINTS : POINTS).map((p) => (
              <li key={p} className="flex gap-2 text-xs leading-relaxed text-foreground/80">
                <BadgeCheck className="mt-0.5 h-3.5 w-3.5 shrink-0 text-primary" />
                {p}
              </li>
            ))}
          </ul>
        )}
        <Button className="mt-4 h-11 w-full" variant={waiting ? "outline" : "default"} onClick={() => setOpen(true)}>
          {waiting ? "View status" : isBuyer ? "Verify my account" : "Verify my license"}
        </Button>
      </div>

      <BottomSheet
        open={open}
        onOpenChange={setOpen}
        title={isBuyer ? "Identity verification" : "Gem License verification"}
      >
        <LicenseUpload trader={trader} onDone={finish} />
      </BottomSheet>
    </>
  );
}
