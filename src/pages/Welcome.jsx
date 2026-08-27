import React from "react";
import WelcomeHero from "@/components/welcome/WelcomeHero";
import WelcomeActions from "@/components/welcome/WelcomeActions";

export default function Welcome() {
  return (
    <div
      className="flex h-full flex-col overflow-hidden bg-welcome-ink"
      style={{ paddingTop: "var(--safe-top)", paddingBottom: "var(--safe-bottom)" }}
    >
      <WelcomeHero />
      <main className="flex flex-1 items-center bg-welcome-ink">
        <WelcomeActions />
      </main>
    </div>
  );
}