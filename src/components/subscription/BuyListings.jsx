import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import BottomSheet from "@/components/ui/bottom-sheet";
import { PlusCircle } from "lucide-react";
import { haptic, isNative } from "@/lib/despia";
import { launchPaywall } from "@/lib/revenuecat";
import { EXTRA_LISTING_PRICE } from "@/lib/gems";

/**
 * Extra listing slots bought outright — they stack on top of the tier capacity
 * and never expire or reset, even across renewal years.
 *
 * The slots are added by the store webhook once payment clears, never by this
 * screen: a client-side grant here meant anyone could mint free listing slots.
 */
export default function BuyListings({ trader, onPurchaseStarted }) {
  const [open, setOpen] = useState(false);

  const buy = () => {
    haptic("light");
    launchPaywall("extra_listings", trader.id);
    setOpen(false);
    onPurchaseStarted?.();
  };

  return (
    <>
      <div className="mx-auto mt-8 max-w-lg rounded-2xl bg-card p-5">
        <div className="flex items-center gap-2">
          <PlusCircle className="h-[18px] w-[18px] text-primary" />
          <p className="text-sm font-medium">Need more room?</p>
        </div>
        <p className="mt-1.5 text-xs leading-relaxed text-muted-foreground">
          Buy extra listing slots from ${EXTRA_LISTING_PRICE} each. They're added to your grade's
          capacity and stay yours for good — nothing resets at renewal.
          {trader?.purchased_listings ? ` You've bought ${trader.purchased_listings} so far.` : ""}
        </p>
        <Button variant="outline" className="mt-4 h-11 w-full" onClick={() => setOpen(true)}>
          Buy extra listings
        </Button>
      </div>

      <BottomSheet open={open} onOpenChange={setOpen} title="Extra listings">
        <div className="mx-auto max-w-md space-y-5 pb-2">
          <p className="text-sm leading-relaxed text-muted-foreground">
            Choose how many slots you want on the next screen. They're billed once through your{" "}
            {isNative ? "app store" : "App Store or Google Play"} account and added to your account as
            soon as the payment clears.
          </p>
          <Button className="w-full" onClick={buy} disabled={!isNative}>
            {isNative ? "Continue to billing" : "Available in the mobile app"}
          </Button>
          {!isNative && (
            <p className="text-center text-xs text-muted-foreground">
              Extra listings are purchased through the Gems24 mobile app.
            </p>
          )}
        </div>
      </BottomSheet>
    </>
  );
}