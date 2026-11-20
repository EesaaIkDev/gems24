import React from "react";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";

export default function WelcomeActions() {
  return (
    <section className="mx-auto flex w-full max-w-md flex-col px-6 py-3 text-center sm:px-8">
      <h1 className="text-balance font-heading text-[2rem] font-bold leading-[1.3] tracking-tight text-foreground sm:text-4xl">
        Your Gemstone Network, <span className="text-primary">Connected.</span>
      </h1>
      <p className="mx-auto mt-4 max-w-[18rem] text-[15px] leading-6 text-muted-foreground">
        Discover gems. Connect with traders. Grow your business.
      </p>
      <div className="mt-9 space-y-3">
        <Button asChild className="w-full">
          <Link to="/onboarding">Get Started</Link>
        </Button>
        <Button asChild variant="outline" className="w-full">
          <Link to="/login">Log In</Link>
        </Button>
      </div>
    </section>
  );
}