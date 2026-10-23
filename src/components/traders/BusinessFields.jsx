import React from "react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { BUSINESS_TYPES, TEAM_SIZES } from "@/lib/gems";
import { chipClass as chip } from "@/components/common/filterChip";

export const EMPTY_BUSINESS = {
  legal_business_name: "",
  business_name: "",
  business_type: "",
  registration_number: "",
  year_founded: "",
  team_size: "",
  website: "",
  contact_role: "",
};

export const businessForm = (t = {}) =>
  Object.fromEntries(Object.keys(EMPTY_BUSINESS).map((k) => [k, t[k] ?? ""]));

/** Company details for business accounts. No documents — KYB happens via Shufti. */
export default function BusinessFields({ form, set }) {
  const pick = (k, v) => set(k, form[k] === v ? "" : v);
  return (
    <div className="space-y-4">
      <div className="space-y-1.5">
        <Label>Registered business name</Label>
        <Input value={form.legal_business_name} onChange={(e) => set("legal_business_name", e.target.value)} className="h-11" />
      </div>
      <div className="space-y-1.5">
        <Label>Trading name (optional)</Label>
        <Input
          placeholder="Shown to buyers; defaults to the registered name"
          value={form.business_name}
          onChange={(e) => set("business_name", e.target.value)}
          className="h-11"
        />
      </div>
      <div className="space-y-1.5">
        <Label>Business type</Label>
        <div className="flex flex-wrap gap-2">
          {BUSINESS_TYPES.map((b) => (
            <button key={b.value} type="button" aria-pressed={form.business_type === b.value} className={chip(form.business_type === b.value)} onClick={() => pick("business_type", b.value)}>
              {b.label}
            </button>
          ))}
        </div>
      </div>
      <div className="space-y-1.5">
        <Label>Company registration number (optional)</Label>
        <Input value={form.registration_number} onChange={(e) => set("registration_number", e.target.value)} className="h-11" />
        <p className="text-xs text-muted-foreground">Private — never shown publicly. Speeds up business verification.</p>
      </div>
      <div className="grid grid-cols-2 gap-3">
        <div className="space-y-1.5">
          <Label>Year founded</Label>
          <Input type="number" placeholder="e.g. 1998" value={form.year_founded} onChange={(e) => set("year_founded", e.target.value)} className="h-11" />
        </div>
        <div className="space-y-1.5">
          <Label>Your role</Label>
          <Input placeholder="e.g. Director" value={form.contact_role} onChange={(e) => set("contact_role", e.target.value)} className="h-11" />
        </div>
      </div>
      <div className="space-y-1.5">
        <Label>Team size</Label>
        <div className="flex flex-wrap gap-2">
          {TEAM_SIZES.map((s) => (
            <button key={s} type="button" aria-pressed={form.team_size === s} className={chip(form.team_size === s)} onClick={() => pick("team_size", s)}>
              {s === "1" ? "Just me" : s}
            </button>
          ))}
        </div>
      </div>
      <div className="space-y-1.5">
        <Label>Website (optional)</Label>
        <Input type="url" placeholder="www.example.com" value={form.website} onChange={(e) => set("website", e.target.value)} className="h-11" />
      </div>
    </div>
  );
}
