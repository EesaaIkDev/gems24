import React from "react";
import { Link } from "react-router-dom";

export default function WelcomeActions() {
  return (
    <section className="mx-auto flex w-full max-w-md flex-col px-7 py-3 text-center sm:px-8">
      <h1 className="text-balance font-heading text-[2rem] font-bold leading-[1.35] tracking-tight text-welcome-text sm:text-4xl">
        Your Gemstone Network, <span className="text-welcome-green">Connected.</span>
      </h1>
      <p className="mx-auto mt-5 max-w-[18rem] text-base leading-7 text-welcome-muted">
        Discover gems. Connect with traders. Grow your business.
      </p>
      <div className="mt-9 space-y-3">
        <Link to="/onboarding" className="welcome-primary flex h-14 w-full cursor-pointer items-center justify-center rounded-xl bg-welcome-green px-6 font-heading text-base font-medium text-welcome-ink transition-colors duration-200 hover:bg-welcome-green-bright focus-visible:ring-2 focus-visible:ring-welcome-green focus-visible:ring-offset-2">
          Get Started
        </Link>
        <Link to="/login" className="welcome-secondary flex h-14 w-full cursor-pointer items-center justify-center rounded-xl border px-6 font-heading text-base font-medium text-welcome-text transition-opacity duration-200 hover:opacity-80 focus-visible:ring-2 focus-visible:ring-welcome-green focus-visible:ring-offset-2">
          Log In
        </Link>
      </div>
    </section>
  );
}