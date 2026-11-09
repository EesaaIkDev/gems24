import React, { useState } from "react";
import { Ticket } from "lucide-react";
import useCurrentTrader from "@/hooks/useCurrentTrader";
import useReferralCode from "@/hooks/useReferralCode";
import { haptic } from "@/lib/despia";
import InviteSheet from "@/components/referral/InviteSheet";

/** Header ticket button that opens the invite sheet. Signed-in profiles only. */
export default function InviteButton() {
  const { trader } = useCurrentTrader();
  const code = useReferralCode(trader);
  const [open, setOpen] = useState(false);

  if (!trader || !code) return null;

  return (
    <>
      <button
        onClick={() => { haptic("light"); setOpen(true); }}
        className="tap-scale flex h-11 w-11 items-center justify-center rounded-full hover:bg-secondary"
        aria-label="Invite a trader"
      >
        <Ticket className="h-5 w-5 text-muted-foreground" aria-hidden="true" />
      </button>
      <InviteSheet
        open={open}
        onOpenChange={setOpen}
        code={code}
        name={trader.business_name || trader.full_name}
      />
    </>
  );
}