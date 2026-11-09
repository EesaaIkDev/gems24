import React from "react";
import { format } from "date-fns";
import GemPattern from "@/components/welcome/GemPattern";
import { referralLink } from "@/lib/referral";

const qrSrc = (url) =>
  `https://api.qrserver.com/v1/create-qr-code/?size=480x480&margin=0&data=${encodeURIComponent(url)}`;

/** The shareable invite card: branded front, or a scannable QR of the invite link. */
export default function InviteCard({ name, code, showQr }) {
  return (
    <div className="relative mx-auto aspect-[3/4] w-full max-w-[20rem] overflow-hidden rounded-[2rem] bg-gradient-to-b from-welcome-green to-welcome-pattern shadow-2xl">
      <div className="opacity-40">
        <GemPattern />
      </div>
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_40%,transparent_0%,hsl(var(--welcome-ink)/0.45)_80%)]" />

      <div className="relative flex h-full flex-col items-center justify-center px-6 text-center text-welcome-text">
        {showQr ? (
          <div className="rounded-3xl bg-welcome-text p-4">
            <img src={qrSrc(referralLink(code))} alt="QR code for your invite link" className="h-44 w-44" />
          </div>
        ) : (
          <>
            <p className="text-[0.6875rem] font-bold uppercase tracking-[0.25em] text-welcome-text/70">Invite to Gems24</p>
            <p className="mt-3 font-heading text-3xl font-semibold leading-tight">{name}</p>
          </>
        )}
        <p className="mt-5 font-mono text-sm tracking-[0.3em] text-welcome-text/85">{code}</p>
      </div>

      <p className="absolute bottom-5 right-6 font-mono text-xs text-welcome-text/60">
        {format(new Date(), "MMM yyyy")}
      </p>
    </div>
  );
}