import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { base44 } from "@/api/base44Client";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { FileUp, Loader2 } from "lucide-react";
import PhotoUploader from "@/components/listings/PhotoUploader";
import StepShell from "@/components/listings/StepShell";
import Spinner from "@/components/common/Spinner";
import SignInPrompt from "@/components/common/SignInPrompt";
import useCurrentTrader from "@/hooks/useCurrentTrader";
import usePopularDefaults from "@/hooks/usePopularDefaults";
import LimitChoice from "@/components/subscription/LimitChoice";
import { GEM_TYPES, TREATMENTS, cap } from "@/lib/gems";
import { effectiveLimit } from "@/lib/referral";
import { createRecord } from "@/lib/offlineSync";
import useOnline from "@/hooks/useOnline";

const EMPTY = {
  photos: [],
  gemstone_type: "sapphire",
  weight_carats: "",
  color: "",
  treatment: "heated",
  origin: "",
  certificate_lab: "",
  certificate_url: "",
  description: "",
  status: "available",
};

const TOTAL = 3;

export default function AddListing() {
  const navigate = useNavigate();
  const { user, trader, loading } = useCurrentTrader();
  const popular = usePopularDefaults();
  const online = useOnline();
  const [step, setStep] = useState(0);
  const [form, setForm] = useState(EMPTY);
  const [saving, setSaving] = useState(false);
  const [uploadingCert, setUploadingCert] = useState(false);
  const [activeCount, setActiveCount] = useState(null);

  const set = (k, v) => setForm((f) => ({ ...f, [k]: v }));

  // Smart defaults: open on the type and treatment traders list most often.
  useEffect(() => {
    if (!popular) return;
    setForm((f) => ({ ...f, gemstone_type: popular.gemstone_type, treatment: popular.treatment }));
  }, [popular]);

  useEffect(() => {
    if (!trader?.id) return;
    base44.entities.Listing.filter({ trader_id: trader.id }).then((rows) =>
      setActiveCount(rows.filter((l) => l.status !== "sold").length)
    );
  }, [trader?.id]);

  const uploadCert = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploadingCert(true);
    const { file_url } = await base44.integrations.Core.UploadFile({ file });
    set("certificate_url", file_url);
    setUploadingCert(false);
  };

  const publish = async () => {
    setSaving(true);
    // Optimistic: saved locally now, pushed to Base44 by the outbox.
    const listing = await createRecord("Listing", {
      ...form,
      weight_carats: Number(form.weight_carats),
      trader_id: trader.id,
      trader_name: trader.full_name,
      trader_country: trader.country || "",
      trader_tier: trader.subscription_tier || "none",
      trader_verified: !!trader.verified,
    });
    // A row created offline has no server id yet — send them to their listings.
    navigate(String(listing.id).startsWith("local-") ? "/profile" : `/listing/${listing.id}`, {
      replace: true,
    });
  };

  const back = () => (step === 0 ? navigate(-1) : setStep(step - 1));

  if (loading) return <Spinner />;
  if (!user) return <SignInPrompt title="Log in to add a listing" />;
  if (!trader) return <SignInPrompt title="Create your trader profile first" cta="Get started" to="/onboarding" />;
  if (trader.account_type === "buyer")
    return (
      <SignInPrompt
        title="Listings are for trader accounts"
        description="Buyer accounts can browse stones and message traders, but can't post listings."
        cta="Browse gemstones"
        to="/gemstones"
        showLogin={false}
      />
    );
  const limit = effectiveLimit(trader);
  if (activeCount !== null && activeCount >= limit)
    return <LimitChoice trader={trader} active={activeCount} limit={limit} />;

  if (step === 0)
    return (
      <StepShell
        step={0}
        total={TOTAL}
        title="Add photos"
        hint="Clear, well-lit shots get the most attention. The first photo leads your post."
        onBack={back}
        onNext={() => setStep(1)}
        nextDisabled={form.photos.length === 0}
        nextLabel={form.photos.length ? "Next" : "Add a photo to continue"}
      >
        <PhotoUploader photos={form.photos} onChange={(p) => set("photos", p)} />
      </StepShell>
    );

  if (step === 1)
    return (
      <StepShell
        step={1}
        total={TOTAL}
        title="Stone details"
        hint="Prices are never shown publicly — traders network with you instead."
        onBack={back}
        onNext={() => setStep(2)}
        nextDisabled={!form.weight_carats || !form.treatment}
      >
        <div className="grid grid-cols-2 gap-3">
          <div className="space-y-1.5">
            <Label>Gemstone type</Label>
            <Select value={form.gemstone_type} onValueChange={(v) => set("gemstone_type", v)}>
              <SelectTrigger className="h-11"><SelectValue /></SelectTrigger>
              <SelectContent>
                {GEM_TYPES.map((g) => (
                  <SelectItem key={g} value={g}>{cap(g)}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-1.5">
            <Label>Weight (carats)</Label>
            <Input
              type="number"
              step="0.01"
              value={form.weight_carats}
              onChange={(e) => set("weight_carats", e.target.value)}
              className="h-11"
            />
          </div>
          <div className="space-y-1.5">
            <Label>Colour</Label>
            <Input value={form.color} onChange={(e) => set("color", e.target.value)} className="h-11" placeholder="Royal blue" />
          </div>
          <div className="space-y-1.5">
            <Label>Treatment</Label>
            <Select value={form.treatment} onValueChange={(v) => set("treatment", v)}>
              <SelectTrigger className="h-11"><SelectValue placeholder="Select" /></SelectTrigger>
              <SelectContent>
                {TREATMENTS.map((t) => (
                  <SelectItem key={t} value={t}>{cap(t)}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>
        <div className="space-y-1.5">
          <Label>Origin / provenance (optional)</Label>
          <Input value={form.origin} onChange={(e) => set("origin", e.target.value)} className="h-11" placeholder="Ceylon, Sri Lanka" />
        </div>
        <div className="space-y-1.5">
          <Label>Description (optional)</Label>
          <Textarea rows={3} value={form.description} onChange={(e) => set("description", e.target.value)} />
        </div>
      </StepShell>
    );

  return (
    <StepShell
      step={2}
      total={TOTAL}
      title="Certificate"
      hint="Optional, but certified stones earn more trust in the network."
      onBack={back}
      onNext={publish}
      nextDisabled={saving}
      nextLabel={saving ? "Publishing…" : "Publish listing"}
    >
      <div className="space-y-1.5">
        <Label>Certificate lab</Label>
        <Input
          value={form.certificate_lab}
          onChange={(e) => set("certificate_lab", e.target.value)}
          className="h-11"
          placeholder="GIA, GRS…"
        />
      </div>
      <div className="space-y-2">
        <Label>Certificate file</Label>
        <label className="flex items-center gap-2 rounded-xl border border-dashed border-border h-12 px-4 text-sm cursor-pointer hover:border-primary/50">
          {uploadingCert ? <Loader2 className="w-4 h-4 animate-spin" /> : <FileUp className="w-4 h-4 text-primary" />}
          <span className="truncate text-muted-foreground">
            {!online
              ? "Certificate upload needs a connection"
              : form.certificate_url
                ? "Certificate uploaded — replace"
                : "Upload certificate"}
          </span>
          <input
            type="file"
            className="hidden"
            onChange={uploadCert}
            disabled={uploadingCert || !online}
          />
        </label>
      </div>
      <div className="space-y-1.5">
        <Label>Status</Label>
        <Select value={form.status} onValueChange={(v) => set("status", v)}>
          <SelectTrigger className="h-11"><SelectValue /></SelectTrigger>
          <SelectContent>
            <SelectItem value="available">Available</SelectItem>
            <SelectItem value="reserved">Reserved</SelectItem>
          </SelectContent>
        </Select>
      </div>
    </StepShell>
  );
}