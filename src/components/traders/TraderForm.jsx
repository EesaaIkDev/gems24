import React, { useState } from "react";
import { base44 } from "@/api/base44Client";
import { Image } from "@/components/ui/image";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Camera, Loader2, User } from "lucide-react";
import { GEM_TYPES, cap } from "@/lib/gems";

export default function TraderForm({ initial = {}, onSave, saving, submitLabel = "Save profile" }) {
  const [form, setForm] = useState({
    full_name: initial.full_name || "",
    business_name: initial.business_name || "",
    profile_photo: initial.profile_photo || "",
    country: initial.country || "",
    city: initial.city || "",
    years_experience: initial.years_experience ?? "",
    specialties: initial.specialties || [],
    bio: initial.bio || "",
    phone: initial.phone || "",
    contact_email: initial.contact_email || "",
  });
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState("");

  const set = (k, v) => setForm({ ...form, [k]: v });

  const toggleSpecialty = (s) =>
    set("specialties", form.specialties.includes(s) ? form.specialties.filter((x) => x !== s) : [...form.specialties, s]);

  const uploadPhoto = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploading(true);
    const { file_url } = await base44.integrations.Core.UploadFile({ file });
    set("profile_photo", file_url);
    setUploading(false);
  };

  const submit = (e) => {
    e.preventDefault();
    if (!form.full_name.trim()) {
      setError("Please enter your full name.");
      return;
    }
    setError("");
    onSave({
      ...form,
      years_experience: form.years_experience === "" ? undefined : Number(form.years_experience),
    });
  };

  return (
    <form onSubmit={submit} className="space-y-5">
      <div className="flex items-center gap-4">
        <div className="w-20 h-20 rounded-2xl overflow-hidden bg-secondary flex items-center justify-center">
          {form.profile_photo ? (
            <Image src={form.profile_photo} alt="Profile" className="w-full h-full" />
          ) : (
            <User className="w-7 h-7 text-muted-foreground/50" />
          )}
        </div>
        <label className="inline-flex items-center gap-2 rounded-xl border border-border px-4 h-11 text-sm font-medium cursor-pointer hover:border-primary/50">
          {uploading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Camera className="w-4 h-4" />}
          {form.profile_photo ? "Change photo" : "Upload photo"}
          <input type="file" accept="image/*" className="hidden" onChange={uploadPhoto} disabled={uploading} />
        </label>
      </div>

      <div className="space-y-1.5">
        <Label>Full name</Label>
        <Input value={form.full_name} onChange={(e) => set("full_name", e.target.value)} className="h-11" />
      </div>

      <div className="space-y-1.5">
        <Label>Business name</Label>
        <Input value={form.business_name} onChange={(e) => set("business_name", e.target.value)} className="h-11" />
      </div>

      <div className="grid grid-cols-2 gap-3">
        <div className="space-y-1.5">
          <Label>Country</Label>
          <Input value={form.country} onChange={(e) => set("country", e.target.value)} className="h-11" />
        </div>
        <div className="space-y-1.5">
          <Label>City</Label>
          <Input value={form.city} onChange={(e) => set("city", e.target.value)} className="h-11" />
        </div>
      </div>

      <div className="space-y-1.5">
        <Label>Years of experience</Label>
        <Input
          type="number"
          value={form.years_experience}
          onChange={(e) => set("years_experience", e.target.value)}
          className="h-11"
        />
      </div>

      <div className="space-y-2">
        <Label>Specialties</Label>
        <div className="flex flex-wrap gap-2">
          {GEM_TYPES.map((s) => (
            <button
              key={s}
              type="button"
              onClick={() => toggleSpecialty(s)}
              className={`rounded-full border px-3.5 py-2 text-xs font-medium transition-colors ${
                form.specialties.includes(s)
                  ? "bg-primary text-primary-foreground border-primary"
                  : "bg-card border-border text-muted-foreground"
              }`}
            >
              {cap(s)}
            </button>
          ))}
        </div>
      </div>

      <div className="space-y-1.5">
        <Label>Short bio</Label>
        <Textarea rows={4} value={form.bio} onChange={(e) => set("bio", e.target.value)} />
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        <div className="space-y-1.5">
          <Label>Phone</Label>
          <Input value={form.phone} onChange={(e) => set("phone", e.target.value)} className="h-11" />
        </div>
        <div className="space-y-1.5">
          <Label>Contact email</Label>
          <Input value={form.contact_email} onChange={(e) => set("contact_email", e.target.value)} className="h-11" />
        </div>
      </div>
      <p className="text-xs text-muted-foreground -mt-2">
        Contact details are only shown to traders you've accepted a connection with.
      </p>

      {error && <p className="text-sm text-destructive">{error}</p>}

      <Button type="submit" disabled={saving} className="w-full h-12 text-base font-semibold">
        {saving ? "Saving…" : submitLabel}
      </Button>
    </form>
  );
}