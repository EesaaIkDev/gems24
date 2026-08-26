import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { Copy, Link2, Share2 } from "lucide-react";
import { toast } from "@/components/ui/use-toast";
import { haptic } from "@/lib/despia";
import { referralLink, shareInvite } from "@/lib/referral";

/**
 * One tap opens the device share sheet with a pre-written invite; the copy
 * buttons cover anywhere the share sheet doesn't reach.
 */
export default function ShareInviteButton({ code, label = "Invite a trader" }) {
  const [busy, setBusy] = useState(false);

  const share = async () => {
    if (!code) return;
    haptic();
    setBusy(true);
    const result = await shareInvite(code);
    setBusy(false);
    if (result === "copied")
      toast({ title: "Invite copied", description: "Paste it anywhere to invite a trader." });
  };

  const copy = async (text, title) => {
    await navigator.clipboard.writeText(text);
    toast({ title });
  };

  return (
    <div className="space-y-2">
      <Button onClick={share} disabled={busy || !code} className="h-12 w-full font-semibold">
        <Share2 className="mr-2 h-4 w-4" /> {label}
      </Button>
      <div className="grid grid-cols-2 gap-2">
        <Button variant="outline" className="h-11" disabled={!code} onClick={() => copy(code, "Code copied")}>
          <Copy className="mr-2 h-4 w-4" /> Copy code
        </Button>
        <Button
          variant="outline"
          className="h-11"
          disabled={!code}
          onClick={() => copy(referralLink(code), "Link copied")}
        >
          <Link2 className="mr-2 h-4 w-4" /> Copy link
        </Button>
      </div>
    </div>
  );
}