import React, { useCallback, useEffect, useRef, useState } from "react";
import { base44 } from "@/api/base44Client";
import { Button } from "@/components/ui/button";
import { AlertCircle, Camera, Clock, Loader2, Upload, X } from "lucide-react";
import { haptic } from "@/lib/despia";
import { LIMITS, STATUS, SUPPORT_EMAIL, documentFor } from "@/lib/verification";

/**
 * Verification document capture.
 *
 * Nothing here can grant verification. Submitting hands the documents to the
 * backend, which rate limits the attempt and queues it for checking; the badge
 * is only ever set by the verificationWebhook function once a decision comes
 * back approved.
 *
 * Documents go to private storage, so they need a signed URL to open — never
 * UploadFile, which puts files on a public URL.
 */
export default function LicenseUpload({ trader, onDone }) {
  const [docs, setDocs] = useState([]);
  const [state, setState] = useState(null);
  const [loading, setLoading] = useState(true);
  const [busy, setBusy] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState("");
  const [limit, setLimit] = useState(null);

  const isBuyer = trader.account_type === "buyer";
  const doc = documentFor(trader);
  const pickRef = useRef(null);
  const cameraRef = useRef(null);

  const load = useCallback(async () => {
    try {
      const rows = await base44.entities.Verification.filter({ trader_id: trader.id });
      setState(rows?.[0] || null);
    } catch {
      setState(null);
    }
    setLoading(false);
  }, [trader.id]);

  useEffect(() => {
    load();
  }, [load]);

  useEffect(
    () => () => {
      docs.forEach((d) => URL.revokeObjectURL(d.url));
    },
    // eslint-disable-next-line react-hooks/exhaustive-deps
    []
  );

  const add = (e) => {
    const files = Array.from(e.target.files || []);
    setDocs((prev) => [
      ...prev,
      ...files.map((f) => ({
        id: `${f.name}-${f.lastModified}-${Math.random()}`,
        name: f.name,
        file: f,
        url: URL.createObjectURL(f),
      })),
    ]);
    e.target.value = "";
  };

  const remove = (id) =>
    setDocs((prev) => {
      const found = prev.find((d) => d.id === id);
      if (found) URL.revokeObjectURL(found.url);
      return prev.filter((d) => d.id !== id);
    });

  const submit = async () => {
    setBusy(true);
    setUploading(true);
    setError("");
    setLimit(null);
    haptic("light");

    try {
      // Private storage: readable only via a short-lived signed URL.
      const uploaded = await Promise.all(
        docs.map((d) => base44.integrations.Core.UploadPrivateFile({ file: d.file }))
      );
      setUploading(false);

      const res = await base44.functions["submitVerification"]({
        documents: uploaded.map((u) => u.file_uri).filter(Boolean),
      });

      if (res?.state === "submitted" || res?.state === "already_pending") {
        docs.forEach((d) => URL.revokeObjectURL(d.url));
        setDocs([]);
        await load();
        setBusy(false);
        return;
      }
      if (res?.state === "already_verified") {
        await onDone();
        return;
      }
      if (res?.state === "blocked" || res?.state === "cooldown" || res?.state === "rate_limited") {
        setLimit(res);
      } else {
        setError(res?.error || "Could not submit. Please try again.");
      }
    } catch (err) {
      setError(err?.message || "Could not submit. Please try again.");
    }
    setUploading(false);
    setBusy(false);
  };

  if (loading) {
    return (
      <div className="flex justify-center py-8">
        <Loader2 className="h-5 w-5 animate-spin text-muted-foreground" />
      </div>
    );
  }

  const status = state?.status || STATUS.NONE;
  const attemptsLeft = Math.max(0, LIMITS.lifetime - (state?.attempt_count || 0));

  if (limit?.state === "blocked" || state?.blocked) {
    return (
      <Notice
        icon={AlertCircle}
        tone="destructive"
        title="Verification locked"
        body={`You've used all ${LIMITS.lifetime} verification attempts. Our team can review your account manually and unlock it.`}
        action={
          <Button asChild variant="outline" className="h-11 w-full">
            <a href={`mailto:${SUPPORT_EMAIL}?subject=Verification%20help`}>Contact support</a>
          </Button>
        }
      />
    );
  }

  // Awaiting a decision — no new submission should be queued.
  if (status === STATUS.PENDING || status === STATUS.REVIEW) {
    return (
      <Notice
        icon={Clock}
        title={status === STATUS.REVIEW ? "Under review" : "Check in progress"}
        body={
          status === STATUS.REVIEW
            ? "A reviewer is taking a closer look at your documents. We'll update your profile automatically once it's done."
            : `We've received your ${doc.label} and it's being checked. You can close this and carry on — your profile updates automatically.`
        }
      />
    );
  }

  if (limit?.state === "cooldown" || limit?.state === "rate_limited") {
    return (
      <Notice
        icon={Clock}
        title={limit.state === "cooldown" ? "Please wait a moment" : "Daily limit reached"}
        body={
          limit.state === "cooldown"
            ? `You can submit again in about ${limit.retryInMinutes} minute${limit.retryInMinutes === 1 ? "" : "s"}.`
            : `You've submitted ${LIMITS.perDay} checks today. You can try again in about ${limit.retryInMinutes} minute${limit.retryInMinutes === 1 ? "" : "s"}.`
        }
      />
    );
  }

  const resubmission = status === STATUS.RESUBMISSION;
  const declined = status === STATUS.DECLINED;
  const lapsed = status === STATUS.EXPIRED || status === STATUS.ABANDONED;
  const retrying = resubmission || declined || lapsed;

  return (
    <div className="mx-auto max-w-md space-y-4 pb-2">
      {resubmission && (
        <Notice
          icon={AlertCircle}
          compact
          title="We need another look"
          body={state?.decline_reason || "Your documents couldn't be read clearly. Please upload them again."}
        />
      )}

      {declined && (
        <Notice
          icon={AlertCircle}
          tone="destructive"
          compact
          title="Verification unsuccessful"
          body={
            state?.decline_reason
              ? `${state.decline_reason} You have ${attemptsLeft} attempt${attemptsLeft === 1 ? "" : "s"} remaining.`
              : `That check didn't pass. You have ${attemptsLeft} attempt${attemptsLeft === 1 ? "" : "s"} remaining.`
          }
        />
      )}

      {lapsed && (
        <Notice
          icon={Clock}
          compact
          title="That check expired"
          body="Your previous submission wasn't completed in time. Upload your documents again when you're ready."
        />
      )}

      <p className="text-sm leading-relaxed text-muted-foreground">
        {isBuyer
          ? `Photograph or upload a ${doc.label} to confirm your identity. Documents are checked for verification only — never shown to anyone.`
          : `Photograph or upload your ${doc.label}, along with a government ID if the license doesn't carry your photo. Documents are checked for verification only — never shown to anyone.`}
      </p>

      <div className="grid grid-cols-2 gap-2">
        <Button variant="outline" className="h-11" onClick={() => cameraRef.current?.click()} disabled={busy}>
          <Camera className="h-4 w-4" /> Take photo
        </Button>
        <Button variant="outline" className="h-11" onClick={() => pickRef.current?.click()} disabled={busy}>
          <Upload className="h-4 w-4" /> Upload scan
        </Button>
      </div>
      <input ref={cameraRef} type="file" accept="image/*" capture="environment" onChange={add} className="hidden" />
      <input ref={pickRef} type="file" accept="image/*,application/pdf" multiple onChange={add} className="hidden" />

      {docs.length > 0 && (
        <div className="space-y-2">
          {docs.map((d) => (
            <div key={d.id} className="flex items-center gap-3 rounded-xl bg-secondary px-3 py-2">
              <span className="flex-1 truncate text-xs">{d.name}</span>
              <button
                onClick={() => remove(d.id)}
                aria-label={`Remove ${d.name}`}
                className="text-muted-foreground"
                disabled={busy}
              >
                <X className="h-4 w-4" />
              </button>
            </div>
          ))}
        </div>
      )}

      {error && <p className="text-sm text-destructive">{error}</p>}

      <Button className="h-11 w-full" onClick={submit} disabled={busy || docs.length === 0}>
        {busy ? (
          <>
            <Loader2 className="h-4 w-4 animate-spin" />
            {uploading ? "Uploading…" : isBuyer ? "Checking your document…" : "Checking your license…"}
          </>
        ) : retrying ? (
          "Submit again"
        ) : (
          "Submit for verification"
        )}
      </Button>

      {retrying && attemptsLeft <= 2 && (
        <p className="text-center text-xs text-muted-foreground">
          {attemptsLeft} attempt{attemptsLeft === 1 ? "" : "s"} remaining
        </p>
      )}
    </div>
  );
}

function Notice({ icon: Icon, title, body, tone, action, compact }) {
  return (
    <div
      className={`rounded-2xl border p-4 ${
        tone === "destructive" ? "border-destructive/30 bg-destructive/5" : "border-border bg-secondary/60"
      } ${compact ? "" : "mx-auto max-w-md"}`}
    >
      <div className="flex items-center gap-2.5">
        <Icon className={`h-[18px] w-[18px] ${tone === "destructive" ? "text-destructive" : "text-primary"}`} />
        <p className="text-sm font-semibold">{title}</p>
      </div>
      <p className="mt-1.5 text-xs leading-relaxed text-muted-foreground">{body}</p>
      {action && <div className="mt-3">{action}</div>}
    </div>
  );
}
