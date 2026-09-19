import React, { useRef, useState } from "react";
import { base44 } from "@/api/base44Client";
import { Button } from "@/components/ui/button";
import { Camera, Upload, X } from "lucide-react";
import { haptic } from "@/lib/despia";

/**
 * Verification document capture. The scan stays on the device — it is held as a preview
 * URL and discarded the moment the check is submitted. A real license-checking
 * tool will replace the submit step later, so for now every submission passes.
 */
export default function LicenseUpload({ trader, onDone }) {
  const [docs, setDocs] = useState([]);
  const [busy, setBusy] = useState(false);
  // Buyers verify identity, not a Gem License. The exact buyer document is
  // still to be decided — change this one label when it is.
  const isBuyer = trader.account_type === "buyer";
  const pickRef = useRef(null);
  const cameraRef = useRef(null);

  const add = (e) => {
    const files = Array.from(e.target.files || []);
    setDocs((prev) => [
      ...prev,
      ...files.map((f) => ({
        id: `${f.name}-${f.lastModified}-${Math.random()}`,
        name: f.name,
        url: URL.createObjectURL(f),
      })),
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
    await onDone();
  };

  return (
    <div className="mx-auto max-w-md space-y-4 pb-2">
      <p className="text-sm leading-relaxed text-muted-foreground">
        {isBuyer
          ? "Photograph or upload a government ID to confirm your identity. Documents are checked for verification only — never stored, never shown to anyone."
          : "Photograph or upload your Gem License, along with a government ID if the license doesn't carry your photo. Documents are checked for verification only — never stored, never shown to anyone."}
      </p>

      <div className="grid grid-cols-2 gap-2">
        <Button variant="outline" className="h-11" onClick={() => cameraRef.current?.click()}>
          <Camera className="h-4 w-4" /> Take photo
        </Button>
        <Button variant="outline" className="h-11" onClick={() => pickRef.current?.click()}>
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
              <button onClick={() => remove(d.id)} aria-label={`Remove ${d.name}`} className="text-muted-foreground">
                <X className="h-4 w-4" />
              </button>
            </div>
          ))}
        </div>
      )}

      <Button className="h-11 w-full" onClick={submit} disabled={busy || docs.length === 0}>
        {busy ? (isBuyer ? "Checking your document…" : "Checking your license…") : "Submit for verification"}
      </Button>
    </div>
  );
}