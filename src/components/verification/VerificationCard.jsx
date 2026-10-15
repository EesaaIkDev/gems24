import React, { useCallback, useEffect, useRef, useState } from "react";
import { Link } from "react-router-dom";
import { AlertCircle, BadgeCheck, Clock, Loader2, ShieldCheck } from "lucide-react";
import { Button } from "@/components/ui/button";
import SuccessSplash from "@/components/subscription/SuccessSplash";
import { base44 } from "@/api/base44Client";
import { haptic, isNative } from "@/lib/despia";
import { openExternal } from "@/lib/openExternal";
import {
  LEVEL_CHECKS,
  LEVEL_LABEL,
  LIMITS,
  STATUS,
  SUPPORT_EMAIL,
  coversRequired,
  heldLevel,
  isAwaitingDecision,
  requiredLevel,
} from "@/lib/verification";

const BENEFIT = {
  buyer: "Optional — traders answer verified buyers first.",
  trader: "A verified badge on your profile and on every stone you list.",
  business: "The Verified Business badge on your profile and every stone you list.",
};

/**
 * Identity verification through Shufti Pro's hosted page. Starting hands the
 * user to Shufti (ID, selfie, and AML/KYB as required); the badge is set only
 * by the shuftiCallback backend function once Shufti confirms the result.
 */
export default function VerificationCard({ trader, onVerified }) {
  const [state, setState] = useState(null);
  const [busy, setBusy] = useState(false);
  const [notice, setNotice] = useState(null);
  const [splash, setSplash] = useState(false);
  const sawPending = useRef(false);

  const isBuyer = trader.account_type === "buyer";
  const level = requiredLevel(trader);
  const held = heldLevel(trader);
  const covered = coversRequired(trader);

  const load = useCallback(async () => {
    const rows = await base44.entities.Verification.filter({ trader_id: trader.id }).catch(() => []);
    setState(rows?.[0] || { status: STATUS.NONE });
  }, [trader.id]);

  useEffect(() => {
    load();
  }, [load, trader.verified, trader.verified_level, trader.account_type]);

  // Returning from Shufti (or coming back to the app): refresh until the result lands.
  useEffect(() => {
    if (!isAwaitingDecision(state?.status)) return;
    const refresh = () => document.visibilityState === "visible" && (load(), onVerified?.());
    const t = setInterval(refresh, 15000);
    document.addEventListener("visibilitychange", refresh);
    return () => {
      clearInterval(t);
      document.removeEventListener("visibilitychange", refresh);
    };
  }, [state?.status, load, onVerified]);

  // Celebrate only a real pending → approved transition seen in this session.
  useEffect(() => {
    if (isAwaitingDecision(state?.status)) sawPending.current = true;
    else if (state?.status === STATUS.APPROVED && covered && sawPending.current) {
      sawPending.current = false;
      setSplash(true);
    }
  }, [state?.status, covered]);

  const start = async () => {
    setBusy(true);
    setNotice(null);
    haptic("light");
    try {
      const { data } = await base44.functions.invoke("submitVerification", {});
      if (data?.state === "redirect" && data.url) {
        // Shufti's hosted page handles document capture and the liveness scan.
        // In the app this opens Despia's in-app browser; the card keeps polling
        // and picks up the result when the user comes back.
        if (openExternal(data.url, { native: isNative }) === "invalid") {
          setNotice({ error: "Verification link was invalid. Please try again." });
        }
      } else if (data?.state === "already_verified") await onVerified?.();
      else setNotice(data);
      await load();
    } catch (err) {
      setNotice({ error: err?.response?.data?.error || "Verification couldn't be started. Please try again." });
    }
    setBusy(false);
  };

  if (!state) return null;

  if (covered) {
    return (
      <>
        <div className="rounded-2xl border border-primary/30 bg-card p-4">
          <div className="flex items-center gap-2.5">
            <BadgeCheck className="h-[18px] w-[18px] text-primary" />
            <p className="text-sm font-semibold">{LEVEL_LABEL[held]}</p>
          </div>
          <p className="mt-1.5 text-xs leading-relaxed text-muted-foreground">
            {held === "buyer"
              ? "Your identity has been checked by our verification partner, Shufti Pro."
              : "Checked by our verification partner, Shufti Pro. Your badge shows on your profile and every stone you list."}
          </p>
        </div>
        {splash && (
          <SuccessSplash
            title={`You're a ${LEVEL_LABEL[held]}`}
            subtitle="Your badge is live across the network."
            onDone={() => setSplash(false)}
          />
        )}
      </>
    );
  }

  const status = state.status || STATUS.NONE;
  const needsPlan = !isBuyer && (!trader.subscription_tier || trader.subscription_tier === "none");
  const attemptsLeft = Math.max(0, LIMITS.lifetime - (state.attempt_count || 0));
  const upgrading = !!held; // e.g. a Verified Trader who moved to Platinum

  if (state.blocked || notice?.state === "blocked") {
    return (
      <Card icon={AlertCircle} tone="destructive" title="Verification locked">
        <p>You've used all {LIMITS.lifetime} verification attempts. Our team can review your account and unlock it.</p>
        <Button asChild variant="outline" className="mt-3 h-11 w-full">
          <a href={`mailto:${SUPPORT_EMAIL}?subject=Verification%20help`}>Contact support</a>
        </Button>
      </Card>
    );
  }

  if (status === STATUS.REVIEW || notice?.state === "under_review") {
    return (
      <Card icon={Clock} title="Under review">
        <p>Your checks are with the Gems24 team for a final review. Your profile updates automatically once it's done.</p>
      </Card>
    );
  }

  const pending = status === STATUS.PENDING;
  const declined = status === STATUS.DECLINED;
  const lapsed = status === STATUS.ABANDONED || status === STATUS.EXPIRED;

  return (
    <>
      <Card
        icon={pending ? Clock : ShieldCheck}
        title={pending ? "Verification in progress" : upgrading ? `Get ${LEVEL_LABEL[level]}` : "Get verified"}
        badge={pending ? "Checking" : isBuyer ? "Optional" : "Not verified"}
      >
        {pending ? (
          <p>
            If you've finished on Shufti's page, your result is being processed and your profile updates automatically.
            Not finished? Continue where you left off.
          </p>
        ) : (
          <>
            {declined && (
              <p className="mb-2 text-destructive">
                {state.decline_reason || "That check didn't pass."} {attemptsLeft} attempt{attemptsLeft === 1 ? "" : "s"} left.
              </p>
            )}
            {lapsed && <p className="mb-2">Your last verification wasn't finished in time. You can start again.</p>}
            <p>{BENEFIT[level]}</p>
            <ul className="mt-3 space-y-1.5">
              {LEVEL_CHECKS[level].map((c) => (
                <li key={c} className="flex gap-2 text-xs leading-relaxed text-foreground/80">
                  <BadgeCheck className="mt-0.5 h-3.5 w-3.5 shrink-0 text-primary" />
                  {c}
                </li>
              ))}
            </ul>
            <p className="mt-3 text-[0.6875rem]">
              Handled securely by Shufti Pro, our verification partner. Gems24 never stores your ID images.
            </p>
          </>
        )}

        {notice?.state === "cooldown" || notice?.state === "rate_limited" ? (
          <p className="mt-3 text-xs font-medium text-foreground/80">
            Please try again in about {notice.retryInMinutes} minute{notice.retryInMinutes === 1 ? "" : "s"}.
          </p>
        ) : notice?.error ? (
          <p className="mt-3 text-xs text-destructive">{notice.error}</p>
        ) : null}

        {needsPlan ? (
          <>
            <p className="mt-3 text-xs font-medium text-foreground/80">Choose a trader plan to get verified.</p>
            <Button asChild className="mt-3 h-11 w-full">
              <Link to="/subscription">Choose a plan</Link>
            </Button>
          </>
        ) : (
          <Button className="mt-4 h-11 w-full" variant={pending ? "outline" : "default"} onClick={start} disabled={busy}>
            {busy && <Loader2 className="h-4 w-4 animate-spin" />}
            {pending ? "Continue verification" : declined || lapsed ? "Try again" : isBuyer ? "Verify my identity" : `Get ${LEVEL_LABEL[level]}`}
          </Button>
        )}
      </Card>
    </>
  );
}

function Card({ icon: Icon, title, badge, tone, children }) {
  return (
    <div className={`rounded-2xl border bg-card p-5 ${tone === "destructive" ? "border-destructive/30" : "border-primary/30"}`}>
      <div className="flex items-center gap-2.5">
        <Icon className={`h-[18px] w-[18px] ${tone === "destructive" ? "text-destructive" : "text-primary"}`} />
        <h2 className="text-sm font-semibold">{title}</h2>
        {badge && (
          <span className="ml-auto text-[0.625rem] font-bold uppercase tracking-wider text-primary">{badge}</span>
        )}
      </div>
      <div className="mt-2 text-sm leading-relaxed text-muted-foreground">{children}</div>
    </div>
  );
}
