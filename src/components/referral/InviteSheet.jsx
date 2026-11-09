import React, { useState } from "react";
import { Drawer } from "vaul";
import { Link2, QrCode, Share2, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { toast } from "@/components/ui/use-toast";
import { haptic } from "@/lib/despia";
import { referralLink, shareInvite } from "@/lib/referral";
import InviteCard from "@/components/referral/InviteCard";

/** Full-height invite sheet: card front or QR, plus one-tap share. */
export default function InviteSheet({ open, onOpenChange, name, code }) {
  const [showQr, setShowQr] = useState(false);

  const share = async () => {
    haptic("heavy");
    if ((await shareInvite(code)) === "copied") toast({ title: "Invite copied" });
  };

  const copyLink = async () => {
    haptic("light");
    await navigator.clipboard.writeText(referralLink(code));
    toast({ title: "Link copied" });
  };

  const iconBtn = "tap-scale flex h-10 w-10 items-center justify-center rounded-full text-foreground";

  return (
    <Drawer.Root open={open} onOpenChange={onOpenChange}>
      <Drawer.Portal>
        <Drawer.Overlay className="fixed inset-0 z-50 bg-black/45" />
        <Drawer.Content
          className="fixed inset-x-0 bottom-0 z-50 flex h-[92dvh] flex-col rounded-t-3xl border-t border-border bg-card text-foreground outline-none"
          style={{ paddingBottom: "calc(var(--safe-bottom) + 1.25rem)" }}
        >
          <Drawer.Title className="sr-only">Invite a trader</Drawer.Title>
          <Drawer.Handle className="mx-auto mt-4 h-1.5 w-10 shrink-0 rounded-full bg-muted-foreground/30" />

          <div className="flex items-center justify-between px-5 pt-3">
            <button className={`${iconBtn} neu-raised-sm bg-background`} onClick={() => onOpenChange(false)} aria-label="Close">
              <X className="h-5 w-5" />
            </button>
            <div className="neu-raised-sm flex items-center gap-0.5 rounded-full bg-background p-1">
              <button
                className={`${iconBtn} ${showQr ? "neu-inset-sm text-primary" : ""}`}
                onClick={() => { haptic("light"); setShowQr((v) => !v); }}
                aria-label={showQr ? "Show invite card" : "Show QR code"}
                aria-pressed={showQr}
              >
                <QrCode className="h-5 w-5" />
              </button>
              <button className={iconBtn} onClick={copyLink} aria-label="Copy invite link">
                <Link2 className="h-5 w-5" />
              </button>
            </div>
          </div>

          <div className="flex min-h-0 flex-1 items-center px-7 py-4">
            <InviteCard name={name} code={code} showQr={showQr} />
          </div>

          <div className="px-6">
            <Button onClick={share} size="lg" className="h-12 w-full">
              <Share2 className="h-4 w-4" /> Share Invite Link
            </Button>
          </div>
        </Drawer.Content>
      </Drawer.Portal>
    </Drawer.Root>
  );
}