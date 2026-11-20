import React from "react";
import WelcomeHero from "@/components/welcome/WelcomeHero";
import WelcomeActions from "@/components/welcome/WelcomeActions";

export default function Welcome() {
  return (
    <div
      className="relative isolate flex h-full flex-col overflow-y-auto overflow-x-hidden bg-background"
      style={{ paddingTop: "var(--safe-top)", paddingBottom: "var(--safe-bottom)" }}
    >
      <WelcomeHero />
      <main className="relative z-10 flex flex-1 items-center justify-center">
        <WelcomeActions />
      </main>
      <footer className="relative z-10 mx-auto w-full max-w-sm px-8 pb-6 pt-8 text-center text-[13px] leading-relaxed text-muted-foreground">
        The marketplace built for the global gemstone trade.
      </footer>
    </div>
  );
}