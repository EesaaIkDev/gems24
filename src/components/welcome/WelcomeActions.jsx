import React from "react";
import { Link } from "react-router-dom";

export default function WelcomeActions() {
  return (
    <section className="mx-auto flex w-full max-w-md flex-col px-7 py-3 text-center sm:px-8">
      <h1 className="text-balance font-heading text-[2rem] font-medium leading-[1.22] tracking-tight text-welcome-text sm:text-4xl">
        Your <span className="text-welcome-green">Gemstone Network</span>, Connected.
      </h1>
      <p className="mx-auto mt-5 max-w-[18rem] text-base leading-7 text-welcome-muted">
        Discover gems. Connect with traders. Grow your business.
      </p>
      <div className="mt-9 space-y-3">
        <Link to="/onboarding" className="flex min-h-14 w-full cursor-pointer items-center justify-center rounded-xl bg-welcome-green px-6 font-heading text-base font-semibold text-welcome-ink transition-colors duration-200 hover:bg-welcome-green-bright focus-visible:ring-2 focus-visible:ring-welcome-green focus-visible:ring-offset-2 focus-visible:ring-offset-welcome-ink">
          Get Started
        </Link>
        <Link to="/login" className="flex min-h-14 w-full cursor-pointer items-center justify-center rounded-xl border border-welcome-text/10 bg-welcome-text/5 px-6 font-heading text-base font-medium text-welcome-text backdrop-blur-md transition-colors duration-200 hover:bg-welcome-text/10 focus-visible:ring-2 focus-visible:ring-welcome-green focus-visible:ring-offset-2 focus-visible:ring-offset-welcome-ink">
          Log In
        </Link>
      </div>
    </section>
  );
}