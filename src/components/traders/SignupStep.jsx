import React, { useState } from "react";
import { base44 } from "@/api/base44Client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { ArrowLeft, Eye, EyeOff, Loader2, Lock, Mail, X } from "lucide-react";
import { InputOTP, InputOTPGroup, InputOTPSlot } from "@/components/ui/input-otp";
import PasswordStrength, { MIN_PASSWORD_LENGTH } from "@/components/auth/PasswordStrength";
import ConsentChecks from "@/components/auth/ConsentChecks";
import { toast } from "@/components/ui/use-toast";

/**
 * Final onboarding step: takes the email + password, emails a verification code
 * and only calls `onVerified(email)` once the code checks out — so the account
 * is created at the end of the flow, never by bouncing out to the login page.
 */
export default function SignupStep({ onVerified, onBack, working }) {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [consent, setConsent] = useState({ terms: false, privacy: false });
  const [otpSent, setOtpSent] = useState(false);
  const [otpCode, setOtpCode] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const canSubmit =
    email.trim() && password.length >= MIN_PASSWORD_LENGTH && consent.terms && consent.privacy;

  const sendCode = async (e) => {
    e.preventDefault();
    setError("");
    if (password.length < MIN_PASSWORD_LENGTH) {
      setError(`Your password needs at least ${MIN_PASSWORD_LENGTH} characters.`);
      return;
    }
    if (password !== confirmPassword) {
      setError("Passwords do not match.");
      return;
    }
    setLoading(true);
    try {
      await base44.auth.register({ email: email.trim(), password });
      setOtpSent(true);
    } catch (err) {
      setError(err.message || "We couldn't start your registration.");
    } finally {
      setLoading(false);
    }
  };

  const verify = async () => {
    setError("");
    setLoading(true);
    try {
      const result = await base44.auth.verifyOtp({ email: email.trim(), otpCode });
      if (result?.access_token) base44.auth.setToken(result.access_token);
      await onVerified(email.trim());
    } catch (err) {
      setError(err.message || "That code isn't valid.");
      setLoading(false);
    }
  };

  const resend = async () => {
    setError("");
    try {
      await base44.auth.resendOtp(email.trim());
      toast({ title: "Code sent", description: "Check your email for the new code." });
    } catch (err) {
      setError(err.message || "Failed to resend the code.");
    }
  };

  const busy = loading || working;

  if (otpSent)
    return (
      <div className="flex flex-col">
        <div className="neu-inset-sm mx-auto flex h-12 w-12 items-center justify-center rounded-2xl bg-background">
          <Mail className="h-5 w-5 text-primary" />
        </div>
        <h2 className="mt-4 text-center text-[1.375rem] font-bold leading-snug">Verify your email</h2>
        <p className="mt-1.5 text-center text-sm text-muted-foreground">
          We sent a 6-digit code to {email.trim()}
        </p>

        {error && <p className="mt-4 text-center text-sm text-destructive">{error}</p>}

        <div className="mt-6 flex justify-center">
          <InputOTP maxLength={6} value={otpCode} onChange={setOtpCode} autoFocus autoComplete="one-time-code">
            <InputOTPGroup>
              {[0, 1, 2, 3, 4, 5].map((i) => (
                <InputOTPSlot key={i} index={i} />
              ))}
            </InputOTPGroup>
          </InputOTP>
        </div>
        {otpCode.length > 0 && (
          <button
            type="button"
            onClick={() => setOtpCode("")}
            className="mx-auto mt-3 inline-flex items-center gap-1 text-xs text-muted-foreground hover:text-primary"
          >
            <X className="h-3 w-3" /> Clear code
          </button>
        )}

        <Button onClick={verify} disabled={busy || otpCode.length < 6} className="mt-7 h-12 w-full text-base font-semibold">
          {busy ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" /> Creating your account…
            </>
          ) : (
            "Verify & create account"
          )}
        </Button>
        <p className="mt-4 text-center text-sm text-muted-foreground">
          Didn't receive it?{" "}
          <button onClick={resend} className="font-medium text-primary hover:underline">
            Resend
          </button>
        </p>
      </div>
    );

  return (
    <div className="flex flex-col">
      <button onClick={onBack} className="inline-flex items-center gap-1.5 self-start text-sm text-muted-foreground hover:text-primary">
        <ArrowLeft className="h-4 w-4" /> Back
      </button>

      <h2 className="mt-5 text-[1.375rem] font-bold leading-snug">Last step — secure your account</h2>
      <p className="mt-1.5 text-sm text-muted-foreground">
        We'll email you a verification code, then your profile goes live.
      </p>

      {error && <p className="mt-4 text-sm text-destructive">{error}</p>}

      <form onSubmit={sendCode} className="mt-5 space-y-3">
        <div className="space-y-1.5">
          <Label htmlFor="signup-email">Email</Label>
          <div className="relative">
            <Mail className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" aria-hidden="true" />
            <Input
              id="signup-email"
              type="email"
              autoComplete="email"
              autoFocus
              placeholder="you@example.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="h-12 pl-10 text-base"
              required
            />
          </div>
        </div>
        <div className="space-y-1.5">
          <Label htmlFor="signup-password">Password</Label>
          <div className="relative">
            <Lock className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" aria-hidden="true" />
            <Input
              id="signup-password"
              type={showPassword ? "text" : "password"}
              autoComplete="new-password"
              placeholder={`At least ${MIN_PASSWORD_LENGTH} characters`}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="h-12 pl-10 pr-10 text-base"
              required
            />
            <button
              type="button"
              onClick={() => setShowPassword((v) => !v)}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
              aria-label={showPassword ? "Hide password" : "Show password"}
            >
              {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
            </button>
          </div>
          <PasswordStrength value={password} />
        </div>
        <div className="space-y-1.5">
          <Label htmlFor="signup-confirm">Confirm password</Label>
          <div className="relative">
            <Lock className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" aria-hidden="true" />
            <Input
              id="signup-confirm"
              type={showPassword ? "text" : "password"}
              autoComplete="new-password"
              placeholder="••••••••"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              className="h-12 pl-10 text-base"
              required
            />
          </div>
        </div>

        <div className="pt-1">
          <ConsentChecks value={consent} onChange={setConsent} />
        </div>

        <Button type="submit" className="h-12 w-full text-base font-semibold" disabled={busy || !canSubmit}>
          {loading ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" /> Sending code…
            </>
          ) : (
            "Send verification code"
          )}
        </Button>
      </form>
    </div>
  );
}