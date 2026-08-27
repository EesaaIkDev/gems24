import React, { useRef, useState } from "react";
import { base44 } from "@/api/base44Client";
import { Button } from "@/components/ui/button";
import { BadgeCheck, Camera, ShieldCheck, Upload, X } from "lucide-react";
import { haptic } from "@/lib/despia";

// Documents stay on the device only — they are held in memory as preview URLs
// and discarded on submit. A real ID-verification SDK will replace this later,
// so for now every submission verifies the trader.
export default function VerificationUpload({ trader, onVerified }) {
  const [docs, setDocs] = useState([]);
  const [busy, setBusy] = useState(false);
  const pickRef = useRef(null);
  const cameraRef = useRef(null);

  const add = (e) => {
    const files = Array.from(e.target.files || []);
    setDocs((prev) => [
      ...prev,
      ...files.map((f) => ({ id: `${f.name}-${f.lastModified}-${Math.random()}`, name: f.name, url: URL.createObjectURL(f) })),
    ]);
    e.target.value = "";
  };

  const remove = (id) =>
    setDocs((prev) => {
      const doc = prev.find((d) => d.id === id);
      if (doc) URL.revokeObjectURL(doc.url);
      return prev.filter((d) => d.id !== id);
    });

  const submit = async () => {
    setBusy(true);
    haptic("light");
    await base44.entities.Trader.update(trader.id, { verified: true });
    docs.forEach((d) => URL.revokeObjectURL(d.url));
    setDocs([]);
    setBusy(false);
    await onVerified();
  };

  if (trader.verified) {
    return (
      <div className="flex items-center gap-3 rounded-2xl border border-border bg-card p-4">
        <BadgeCheck className="h-[18px] w-[18px] text-primary" />
        <div>
          <p className="text-sm font-medium">Verified trader</p>
          <p className="text-xs text-muted-foreground">Your identity documents have been approved.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="rounded-2xl border border-border bg-card p-4">
      <div className="flex items-center gap-2">
        <ShieldCheck className="h-[18px] w-[18px] text-primary" />
        <p className="text-sm font-medium">Trader verification</p>
      </div>
      <p className="mt-1.5 text-xs leading-relaxed text-muted-foreground">
        Upload a photo or scan of your ID and any trade documents. Files are checked for verification
        only and are never stored or shared.
      </p>

      <div className="mt-3 grid grid-cols-2 gap-2">
        <Button variant="outline" className="h-11" onClick={() => cameraRef.current?.click()}>
          <Camera className="h-4 w-4" /> Take photo
        </Button>
        <Button variant="outline" className="h-11" onClick={() => pickRef.current?.click()}>
          <Upload className="h-4 w-4" /> Upload file
        </Button>
      </div>
      <input ref={cameraRef} type="file" accept="image/*" capture="environment" onChange={add} className="hidden" />
      <input ref={pickRef} type="file" accept="image/*,application/pdf" multiple onChange={add} className="hidden" />

      {docs.length > 0 && (
        <div className="mt-3 space-y-2">
          {docs.map((d) => (
            <div key={d.id} className="flex items-center gap-3 rounded-xl bg-secondary px-3 py-2">
              <span className="flex-1 truncate text-xs">{d.name}</span>
              <button onClick={() => remove(d.id)} aria-label={`Remove ${d.name}`} className="text-muted-foreground">
                <X className="h-4 w-4" />
              </button>
            </div>
          ))}
        </div>
      )}

      <Button className="mt-3 h-11 w-full" onClick={submit} disabled={busy || docs.length === 0}>
        {busy ? "Submitting…" : "Submit for verification"}
      </Button>
    </div>
  );
}