import React, { useState } from "react";
import { base44 } from "@/api/base44Client";
import { Image } from "@/components/ui/image";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Camera, Loader2, User } from "lucide-react";
import { detectCountry } from "@/lib/locale";
import { countWords, limitWords } from "@/lib/words";
import CountrySelect from "./CountrySelect";
import PhoneRegionSelect from "./PhoneRegionSelect";

const SPECIALTY_WORD_LIMIT = 20;
const BIO_WORD_LIMIT = 70;

/** Splits a stored phone into a dial code and the local number. */
function splitPhone(phone = "") {
  const match = phone.trim().match(/^(\+\d{1,4})\s*(.*)$/);
  return match ? { code: match[1], number: match[2] } : { code: "", number: phone };
}

export default function TraderForm({ initial = {}, onSave, saving, submitLabel = "Save profile" }) {
  const initialPhone = splitPhone(initial.phone || "");
  const [form, setForm] = useState({
    full_name: initial.full_name || "",
    business_name: initial.business_name || "",
    profile_photo: initial.profile_photo || "",
    country: initial.country || detectCountry(),
    city: initial.city || "",
    years_experience: initial.years_experience ?? "",
    bio: initial.bio || "",
    contact_email: initial.contact_email || "",
  });
  const [specialtiesText, setSpecialtiesText] = useState((initial.specialties || []).join(", "));
  const [phoneCode, setPhoneCode] = useState(initialPhone.code);
  const [phoneNumber, setPhoneNumber] = useState(initialPhone.number);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState("");

  const set = (k, v) => setForm({ ...form, [k]: v });

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
      specialties: specialtiesText
        .split(",")
        .map((s) => s.trim())
        .filter(Boolean),
      phone: phoneNumber.trim() ? `${phoneCode} ${phoneNumber.trim()}`.trim() : "",
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
        <Label>Business name (optional)</Label>
        <Input value={form.business_name} onChange={(e) => set("business_name", e.target.value)} className="h-11" />
      </div>

      <div className="grid grid-cols-2 gap-3">
        <div className="space-y-1.5">
          <Label>Country</Label>
          <CountrySelect value={form.country} onChange={(v) => set("country", v)} />
        </div>
        <div className="space-y-1.5">
          <Label>City</Label>
          <Input value={form.city} onChange={(e) => set("city", e.target.value)} className="h-11" />
        </div>
      </div>

      <div className="space-y-1.5">
        <Label>How long have you been in this industry?</Label>
        <Input
          type="number"
          placeholder="Years, e.g. 8"
          value={form.years_experience}
          onChange={(e) => set("years_experience", e.target.value)}
          className="h-11"
        />
      </div>

      <div className="space-y-1.5">
        <Label>What do you specialise in?</Label>
        <Textarea
          rows={2}
          placeholder="e.g. Ceylon blue sapphires, unheated padparadscha, rough spinel"
          value={specialtiesText}
          onChange={(e) => setSpecialtiesText(limitWords(e.target.value, SPECIALTY_WORD_LIMIT))}
        />
        <p className="text-xs text-muted-foreground">
          Separate with commas · {countWords(specialtiesText)}/{SPECIALTY_WORD_LIMIT} words
        </p>
      </div>

      <div className="space-y-1.5">
        <Label>Short bio</Label>
        <Textarea
          rows={4}
          value={form.bio}
          onChange={(e) => set("bio", limitWords(e.target.value, BIO_WORD_LIMIT))}
        />
        <p className="text-xs text-muted-foreground">
          {countWords(form.bio)}/{BIO_WORD_LIMIT} words
        </p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        <div className="space-y-1.5">
          <Label>Phone</Label>
          <div className="space-y-2">
            <PhoneRegionSelect value={phoneCode} onChange={setPhoneCode} />
            <Input
              type="tel"
              placeholder="771234567"
              value={phoneNumber}
              onChange={(e) => setPhoneNumber(e.target.value)}
              className="h-11"
            />
          </div>
          <p className="text-xs text-muted-foreground">
            Your number is never revealed to anyone — it stays private.
          </p>
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