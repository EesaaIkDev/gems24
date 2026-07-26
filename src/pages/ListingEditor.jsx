import React, { useEffect, useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import { base44 } from "@/api/base44Client";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { ArrowLeft, FileUp, Loader2 } from "lucide-react";
import PhotoUploader from "@/components/listings/PhotoUploader";
import Spinner from "@/components/common/Spinner";
import SignInPrompt from "@/components/common/SignInPrompt";
import useCurrentTrader from "@/hooks/useCurrentTrader";
import { GEM_TYPES, TREATMENTS, cap, tierLimit } from "@/lib/gems";

const EMPTY = {
  photos: [],
  gemstone_type: "sapphire",
  weight_carats: "",
  color: "",
  treatment: "",
  origin: "",
  certificate_lab: "",
  certificate_url: "",
  description: "",
  status: "available",
};

export default function ListingEditor() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user, trader, loading } = useCurrentTrader();
  const [form, setForm] = useState(EMPTY);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [uploadingCert, setUploadingCert] = useState(false);
  const [blocked, setBlocked] = useState(false);

  const set = (k, v) => setForm((f) => ({ ...f, [k]: v }));

  useEffect(() => {
    if (id) base44.entities.Listing.get(id).then((l) => setForm({ ...EMPTY, ...l }));
  }, [id]);

  useEffect(() => {
    if (!trader?.id || id) return;
    base44.entities.Listing.filter({ trader_id: trader.id }).then((rows) => {
      const active = rows.filter((l) => l.status !== "sold").length;
      setBlocked(active >= tierLimit(trader.subscription_tier));
    });
  }, [trader?.id, trader?.subscription_tier, id]);

  const uploadCert = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploadingCert(true);
    const { file_url } = await base44.integrations.Core.UploadFile({ file });
    set("certificate_url", file_url);
    setUploadingCert(false);
  };

  const submit = async (e) => {
    e.preventDefault();
    if (!form.weight_carats || !form.treatment || !form.gemstone_type) {
      setError("Gemstone type, weight and treatment are required.");
      return;
    }
    setError("");
    setSaving(true);
    const payload = {
      photos: form.photos,
      gemstone_type: form.gemstone_type,
      weight_carats: Number(form.weight_carats),
      color: form.color,
      treatment: form.treatment,
      origin: form.origin,
      certificate_lab: form.certificate_lab,
      certificate_url: form.certificate_url,
      description: form.description,
      status: form.status,
      trader_id: trader.id,
      trader_name: trader.full_name,
      trader_country: trader.country || "",
      trader_tier: trader.subscription_tier || "none",
      trader_verified: !!trader.verified,
    };
    if (id) await base44.entities.Listing.update(id, payload);
    else await base44.entities.Listing.create(payload);
    navigate("/my-listings", { replace: true });
  };

  if (loading) return <Spinner />;
  if (!user) return <SignInPrompt title="Sign in to create a listing" />;
  if (!trader) return <SignInPrompt title="Create your trader profile first" cta="Get started" to="/onboarding" />;
  if (blocked)
    return (
      <SignInPrompt
        title="Upgrade to add more listings"
        description="You've reached the active listing limit for your current plan."
        cta="View plans"
        to="/subscription"
      />
    );

  return (
    <div className="px-4 pt-4 pb-10 max-w-lg mx-auto">
      <Link to="/my-listings" className="inline-flex items-center gap-1.5 text-sm text-muted-foreground hover:text-primary">
        <ArrowLeft className="w-4 h-4" /> My listings
      </Link>
      <h1 className="mt-4 text-[26px] font-bold leading-tight">{id ? "Edit listing" : "New listing"}</h1>
      <p className="mt-1.5 text-sm text-muted-foreground">Prices are never shown publicly — buyers enquire instead.</p>

      <form onSubmit={submit} className="mt-6 space-y-5">
        <div className="space-y-2">
          <Label>Photos</Label>
          <PhotoUploader photos={form.photos} onChange={(p) => set("photos", p)} />
        </div>

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
        </div>

        <div className="grid grid-cols-2 gap-3">
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
          <Label>Certificate lab (optional)</Label>
          <Input value={form.certificate_lab} onChange={(e) => set("certificate_lab", e.target.value)} className="h-11" placeholder="GIA, GRS…" />
        </div>

        <div className="space-y-2">
          <Label>Certificate file (optional)</Label>
          <label className="flex items-center gap-2 rounded-xl border border-dashed border-border h-12 px-4 text-sm cursor-pointer hover:border-primary/50">
            {uploadingCert ? <Loader2 className="w-4 h-4 animate-spin" /> : <FileUp className="w-4 h-4 text-primary" />}
            <span className="truncate text-muted-foreground">
              {form.certificate_url ? "Certificate uploaded — replace" : "Upload certificate"}
            </span>
            <input type="file" className="hidden" onChange={uploadCert} disabled={uploadingCert} />
          </label>
        </div>

        <div className="space-y-1.5">
          <Label>Description</Label>
          <Textarea rows={4} value={form.description} onChange={(e) => set("description", e.target.value)} />
        </div>

        <div className="space-y-1.5">
          <Label>Status</Label>
          <Select value={form.status} onValueChange={(v) => set("status", v)}>
            <SelectTrigger className="h-11"><SelectValue /></SelectTrigger>
            <SelectContent>
              <SelectItem value="available">Available</SelectItem>
              <SelectItem value="reserved">Reserved</SelectItem>
              <SelectItem value="sold">Sold</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {error && <p className="text-sm text-destructive">{error}</p>}

        <Button type="submit" disabled={saving} className="w-full h-12 text-base font-semibold">
          {saving ? "Saving…" : id ? "Save changes" : "Publish listing"}
        </Button>
      </form>
    </div>
  );
}