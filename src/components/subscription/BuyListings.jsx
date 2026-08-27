import React, { useState } from "react";
import { base44 } from "@/api/base44Client";
import { Button } from "@/components/ui/button";
import BottomSheet from "@/components/ui/bottom-sheet";
import { Minus, Plus, PlusCircle } from "lucide-react";
import { haptic } from "@/lib/despia";
import { EXTRA_LISTING_PRICE } from "@/lib/gems";

/**
 * Extra listing slots bought outright — they stack on top of the tier capacity
 * and never expire or reset, even across renewal years.
 */
export default function BuyListings({ trader, onPurchased }) {
  const [open, setOpen] = useState(false);
  const [qty, setQty] = useState(1);
  const [busy, setBusy] = useState(false);

  const step = (n) => {
    haptic("light");
    setQty((q) => Math.min(50, Math.max(1, q + n)));
  };

  const buy = async () => {
    setBusy(true);
    haptic("light");
    await base44.entities.Trader.update(trader.id, {
      purchased_listings: (trader.purchased_listings || 0) + qty,
    });
    setBusy(false);
    setOpen(false);
    setQty(1);
    onPurchased?.(qty);
  };

  return (
    <>
      <div className="mx-auto mt-8 max-w-lg rounded-2xl bg-card p-5">
        <div className="flex items-center gap-2">
          <PlusCircle className="h-[18px] w-[18px] text-primary" />
          <p className="text-sm font-medium">Need more room?</p>
        </div>
        <p className="mt-1.5 text-xs leading-relaxed text-muted-foreground">
          Buy extra listing slots at ${EXTRA_LISTING_PRICE} each. They're added to your grade's capacity
          and stay yours for good — nothing resets at renewal.
          {trader?.purchased_listings ? ` You've bought ${trader.purchased_listings} so far.` : ""}
        </p>
        <Button variant="outline" className="mt-4 h-11 w-full" onClick={() => setOpen(true)}>
          Buy extra listings
        </Button>
      </div>

      <BottomSheet open={open} onOpenChange={setOpen} title="Extra listings">
        <div className="mx-auto max-w-md space-y-5 pb-2">
          <div className="flex items-center justify-between">
            <Button variant="outline" size="icon" onClick={() => step(-1)} aria-label="One fewer">
              <Minus className="h-4 w-4" />
            </Button>
            <div className="text-center">
              <p className="font-heading text-3xl font-bold leading-none">{qty}</p>
              <p className="mt-1 text-xs text-muted-foreground">listing slot{qty === 1 ? "" : "s"}</p>
            </div>
            <Button variant="outline" size="icon" onClick={() => step(1)} aria-label="One more">
              <Plus className="h-4 w-4" />
            </Button>
          </div>
          <p className="text-center font-heading text-xl font-bold">
            ${qty * EXTRA_LISTING_PRICE}
            <span className="ml-1 text-xs font-medium text-muted-foreground">one-time</span>
          </p>
          <Button className="w-full" onClick={buy} disabled={busy}>
            {busy ? "Processing…" : "Continue to payment"}
          </Button>
        </div>
      </BottomSheet>
    </>
  );
}