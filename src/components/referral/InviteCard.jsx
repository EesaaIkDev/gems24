import React from "react";
import { format } from "date-fns";
import GemPattern from "@/components/welcome/GemPattern";
import { referralLink } from "@/lib/referral";

const qrSrc = (url) =>
  `https://api.qrserver.com/v1/create-qr-code/?size=480x480&margin=0&data=${encodeURIComponent(url)}`;

/** The shareable invite card: flat branded front, or a scannable QR of the invite link. */
export default function InviteCard({ name, code, showQr }) {
  return (
    <div className="relative mx-auto aspect-[3/4] w-full max-w-[20rem] overflow-hidden rounded-xl bg-primary">
      <div className="opacity-30">
        <GemPattern />
      </div>

      <div className="relative flex h-full flex-col items-center justify-center px-6 text-center text-primary-foreground">
        {showQr ? (
          <div className="rounded-xl bg-primary-foreground p-4">
            <img src={qrSrc(referralLink(code))} alt="QR code for your invite link" className="h-44 w-44" />
          </div>
        ) : (
          <>
            <p className="text-[0.6875rem] font-semibold uppercase tracking-[0.2em] text-primary-foreground/80">Invite to Gems24</p>
            <p className="mt-3 font-heading text-3xl font-bold leading-tight">{name}</p>
          </>
        )}
        <p className="mt-5 font-mono text-sm tracking-[0.3em] text-primary-foreground/90">{code}</p>
      </div>

      <p className="absolute bottom-5 right-6 font-mono text-xs text-primary-foreground/75">
        {format(new Date(), "MMM yyyy")}
      </p>
    </div>
  );
}