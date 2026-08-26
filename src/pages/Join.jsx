import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Check, Copy } from "lucide-react";
import { LOGO_URL } from "@/lib/gems";
import { setPendingReferralCode } from "@/lib/referral";

/** Public landing page for referral links: /join?code=ABC123 */
export default function Join() {
  const code = (new URLSearchParams(window.location.search).get("code") || "").toUpperCase();
  const [copied, setCopied] = useState(false);

  // Remember it so the code is pre-filled when they reach onboarding.
  useEffect(() => {
    if (code) setPendingReferralCode(code);
  }, [code]);

  const copy = async () => {
    await navigator.clipboard.writeText(code);
    setCopied(true);
  };

  return (
    <div
      className="h-full overflow-y-auto bg-welcome-ink px-6 py-12 text-welcome-text"
      style={{ paddingTop: "calc(var(--safe-top) + 3rem)", paddingBottom: "calc(var(--safe-bottom) + 3rem)" }}
    >
      <div className="mx-auto max-w-sm text-center">
        <img src={LOGO_URL} alt="Gems24" className="mx-auto h-16 w-16" />
        <h1 className="mt-5 font-heading text-[1.75rem] font-bold leading-tight">
          You've been invited to Gems24
        </h1>
        <p className="mt-3 text-sm leading-relaxed text-welcome-muted">
          The global network for gemstone traders — publish your stones, reach verified traders
          worldwide and message them directly.
        </p>

        {code && (
          <div className="mt-8 rounded-2xl border border-welcome-border bg-welcome-panel p-6">
            <p className="text-xs uppercase tracking-wider text-welcome-subtle">Your referral code</p>
            <p className="mt-2 font-heading text-4xl font-bold tracking-[0.2em] text-welcome-green-bright">
              {code}
            </p>
            <Button onClick={copy} className="mt-5 h-12 w-full font-semibold">
              {copied ? <Check className="mr-2 h-4 w-4" /> : <Copy className="mr-2 h-4 w-4" />}
              {copied ? "Code copied" : "Copy code"}
            </Button>
          </div>
        )}

        <Button asChild variant="outline" className="mt-4 h-12 w-full font-semibold">
          <Link to="/register">Get the app & join free</Link>
        </Button>
        <p className="mt-4 text-xs text-welcome-subtle">
          Enter this code during signup so your invite is credited.
        </p>
      </div>
    </div>
  );
}