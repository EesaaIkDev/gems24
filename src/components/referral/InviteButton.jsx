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
        className="glass-clear glass-press flex h-10 w-10 items-center justify-center rounded-full"
        aria-label="Invite a trader"
      >
        <Ticket className="h-5 w-5 text-foreground/80" aria-hidden="true" />
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