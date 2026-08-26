import React from "react";
import WelcomeHero from "@/components/welcome/WelcomeHero";
import WelcomeActions from "@/components/welcome/WelcomeActions";

export default function Welcome() {
  return (
    <div className="h-full overflow-y-auto overflow-x-hidden bg-welcome-ink" style={{ paddingTop: "var(--safe-top)", paddingBottom: "var(--safe-bottom)" }}>
      <WelcomeHero />
      <main className="min-h-[53svh] bg-welcome-ink">
        <WelcomeActions />
      </main>
    </div>
  );
}