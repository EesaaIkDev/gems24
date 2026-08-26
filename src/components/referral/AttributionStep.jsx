import React, { useState } from "react";
import { ArrowLeft, Instagram, Link2, Loader2, MoreHorizontal, Users, Youtube } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { getPendingReferralCode, validateReferralCode } from "@/lib/referral";

const SOURCES = [
{ key: "instagram", icon: Instagram, label: "Instagram" },
{ key: "youtube", icon: Youtube, label: "YouTube" },
{ key: "friend", icon: Users, label: "From a friend" },
{ key: "referral", icon: Link2, label: "Referral link or code" },
{ key: "other", icon: MoreHorizontal, label: "Somewhere else" }];


/** First onboarding step: where they came from, plus referral-code capture. */
export default function AttributionStep({ onDone }) {
  const [source, setSource] = useState(null);
  const [code, setCode] = useState(getPendingReferralCode());
  const [checking, setChecking] = useState(false);
  const [error, setError] = useState("");

  const submitCode = async () => {
    setError("");
    setChecking(true);
    const valid = await validateReferralCode(code);
    setChecking(false);
    if (!valid) {
      setError("That code isn't valid. Check it with the trader who sent it, or skip this step.");
      return;
    }
    onDone({ source: "referral", code: code.trim().toUpperCase() });
  };

  if (source === "referral")
  return (
    <div>
        <button
        onClick={() => setSource(null)}
        className="inline-flex items-center gap-1.5 text-sm text-muted-foreground hover:text-primary">
        
          <ArrowLeft className="h-4 w-4" /> Back
        </button>
        <h1 className="mt-4 font-heading text-[26px] font-bold leading-tight">Enter your referral code</h1>
        <p className="mt-1.5 text-sm text-muted-foreground">
          Add the code the trader gave you so their invite is credited.
        </p>
        <div className="mt-6 space-y-1.5">
          <Label htmlFor="referral">Referral code</Label>
          <Input
          id="referral"
          value={code}
          onChange={(e) => {
            setCode(e.target.value.toUpperCase());
            setError("");
          }}
          placeholder="e.g. AB3K7Z"
          className="h-12 tracking-[0.2em]"
          autoCapitalize="characters"
          autoFocus />
        
          {error && <p className="text-xs text-destructive">{error}</p>}
        </div>
        <Button className="mt-6 h-12 w-full font-semibold" disabled={checking || !code.trim()} onClick={submitCode}>
          {checking ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
          {checking ? "Checking code…" : "Continue"}
        </Button>
        <Button variant="ghost" className="mt-1 w-full text-muted-foreground" onClick={() => onDone({ source: "referral", code: "" })}>
          I don't have a code
        </Button>
      </div>);


  return (
    <div>
      <h1 className="font-heading text-[26px] font-bold leading-tight">How did you hear about us?</h1>
      <p className="mt-1.5 text-sm text-muted-foreground hidden">Pick whichever is closest — it only takes a tap.</p>
      <div className="mt-6 space-y-2.5">
        {SOURCES.map(({ key, icon: Icon, label }) =>
        <button
          key={key}
          onClick={() => key === "referral" ? setSource("referral") : onDone({ source: key, code: "" })}
          className="flex w-full items-center gap-3 rounded-2xl bg-card px-4 py-4 text-left">
          
            <span className="neu-inset-sm flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-background">
              <Icon className="h-[1.125rem] w-[1.125rem] text-primary" />
            </span>
            <span className="font-medium">{label}</span>
          </button>
        )}
      </div>
    </div>);

}