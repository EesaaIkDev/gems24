import React from "react";
import { Image } from "@/components/ui/image";
import { LOGO_URL } from "@/lib/gems";

export default function WelcomeHero() {
  return (
    <section className="relative flex h-[37svh] min-h-[190px] max-h-[360px] shrink-0 items-center justify-center px-8 py-10">
      <svg aria-hidden="true" viewBox="0 0 600 800" preserveAspectRatio="xMidYMin slice" className="pointer-events-none absolute left-1/2 top-0 -z-10 h-[85svh] w-screen max-w-3xl -translate-x-1/2 text-welcome-green">
        <path fill="currentColor" opacity=".035" d="M0 0 300 160 80 420Z M600 0 300 160 520 420Z" />
        <path fill="currentColor" opacity=".025" d="m80 420 220-260 220 260-220 300Z" />
        <path fill="currentColor" opacity=".04" d="m0 0 80 420L0 680Z m600 0-80 420 80 260Z" />
      </svg>
      <div className="flex flex-col items-center gap-4">
        <Image src={LOGO_URL} alt="" className="h-16 w-16 sm:h-20 sm:w-20" fittingType="fit" />
        <p className="font-display text-4xl font-semibold tracking-tight text-welcome-text sm:text-5xl">Gems24</p>
      </div>
    </section>);

}