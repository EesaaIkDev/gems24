import React from "react";
import { Link } from "react-router-dom";
import { base44 } from "@/api/base44Client";
import { Button } from "@/components/ui/button";
import { LOGO_URL } from "@/lib/gems";

export default function SignInPrompt({ title, description, cta = "Log in", to, showLogin = true }) {
  return (
    <div className="flex flex-col items-center justify-center text-center px-6 py-20">
      <img src={LOGO_URL} alt="Gems24" className="w-16 h-16" />
      <h2 className="mt-5 text-xl font-bold">{title}</h2>
      <p className="mt-2 text-sm text-muted-foreground max-w-xs">
        {description || "Join Gems24 to publish listings, chat with buyers and grow your trader network."}
      </p>
      {to ? (
        <Button asChild size="lg" className="mt-6">
          <Link to={to}>{cta}</Link>
        </Button>
      ) : (
        <Button size="lg" className="mt-6" onClick={() => base44.auth.redirectToLogin()}>
          {cta}
        </Button>
      )}
      {/* Guests always get a way back into an existing account. */}
      {showLogin && to && (
        <Button asChild variant="outline" size="lg" className="mt-3">
          <Link to="/login">Log in</Link>
        </Button>
      )}
    </div>
  );
}