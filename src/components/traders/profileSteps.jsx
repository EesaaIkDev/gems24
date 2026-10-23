import React from "react";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { countWords, limitWords } from "@/lib/words";
import { BUSINESS_TYPES, TEAM_SIZES } from "@/lib/gems";
import { chipClass as chip } from "@/components/common/filterChip";
import CountrySelect from "./CountrySelect";
import PhoneRegionSelect from "./PhoneRegionSelect";
import PhotoStep from "./PhotoStep";

const SPECIALTY_WORD_LIMIT = 20;
const BIO_WORD_LIMIT = 70;

const text = (key, { autoFocus, type, placeholder } = {}) => ({ form, set }) => (
  <Input
    autoFocus={autoFocus}
    type={type}
    placeholder={placeholder}
    value={form[key]}
    onChange={(e) => set(key, e.target.value)}
    className="h-12 text-base"
  />
);

const choices = (key, options) => ({ form, set }) => (
  <div className="flex flex-wrap gap-2">
    {options.map((o) => (
      <button
        key={o.value}
        type="button"
        aria-pressed={form[key] === o.value}
        className={chip(form[key] === o.value)}
        onClick={() => set(key, form[key] === o.value ? "" : o.value)}
      >
        {o.label}
      </button>
    ))}
  </div>
);

const specialtiesStep = (title, placeholder) => ({
  key: "specialties",
  title,
  hint: "Separate with commas.",
  optional: true,
  render: ({ form, set }) => (
    <>
      <Textarea
        rows={3}
        placeholder={placeholder}
        value={form.specialtiesText}
        onChange={(e) => set("specialtiesText", limitWords(e.target.value, SPECIALTY_WORD_LIMIT))}
      />
      <p className="mt-2 text-xs text-muted-foreground">
        {countWords(form.specialtiesText)}/{SPECIALTY_WORD_LIMIT} words
      </p>
    </>
  ),
});

const bioStep = (title) => ({
  key: "bio",
  title,
  optional: true,
  render: ({ form, set }) => (
    <>
      <Textarea rows={5} value={form.bio} onChange={(e) => set("bio", limitWords(e.target.value, BIO_WORD_LIMIT))} />
      <p className="mt-2 text-xs text-muted-foreground">
        {countWords(form.bio)}/{BIO_WORD_LIMIT} words
      </p>
    </>
  ),
});

const phoneStep = (title) => ({
  key: "phone",
  title,
  hint: "Kept completely private — it's never shown to anyone on Gems24.",
  optional: true,
  render: ({ form, set }) => (
    <div className="space-y-2">
      <PhoneRegionSelect value={form.phoneCode} onChange={(v) => set("phoneCode", v)} />
      <Input
        type="tel"
        placeholder="771234567"
        value={form.phoneNumber}
        onChange={(e) => set("phoneNumber", e.target.value)}
        className="h-12 text-base"
      />
    </div>
  ),
});

const emailStep = (title) => ({
  key: "contact_email",
  title,
  hint: "Optional — messaging happens right here in Gems24 chat. This is only shown to traders you've accepted a connection with.",
  optional: true,
  render: text("contact_email", { type: "email" }),
});

const photoStep = (title) => ({
  key: "profile_photo",
  title,
  hint: "Optional — you can always add one later.",
  optional: true,
  render: ({ form, set }) => <PhotoStep value={form.profile_photo} onChange={(v) => set("profile_photo", v)} />,
});

/** Business accounts: company first, then the person running the account. No documents — KYB is via Shufti. */
function businessSteps() {
  return [
    {
      key: "legal_business_name",
      title: "What's your registered business name?",
      hint: "Your company's legal name, as registered.",
      valid: (f) => f.legal_business_name.trim().length >= 2,
      error: "Please enter your registered business name.",
      render: text("legal_business_name", { autoFocus: true, placeholder: "e.g. Ratnapura Heritage Gems (Pvt) Ltd" }),
    },
    {
      key: "business_name",
      title: "Do you trade under a different name?",
      hint: "Optional — this is the name buyers see. Leave blank to use your registered name.",
      optional: true,
      render: text("business_name"),
    },
    {
      key: "business_type",
      title: "What type of business is it?",
      optional: true,
      render: choices("business_type", BUSINESS_TYPES),
    },
    {
      key: "registration_number",
      title: "Company registration number",
      hint: "Optional — private, never shown publicly. It speeds up business verification later.",
      optional: true,
      render: text("registration_number", { placeholder: "e.g. PV 12345" }),
    },
    {
      key: "country",
      title: "Where is your business based?",
      render: ({ form, set }) => <CountrySelect value={form.country} onChange={(v) => set("country", v)} />,
    },
    { key: "city", title: "And which city?", optional: true, render: text("city") },
    {
      key: "year_founded",
      title: "When was your business founded?",
      optional: true,
      valid: (f) => !f.year_founded || (Number(f.year_founded) >= 1800 && Number(f.year_founded) <= new Date().getFullYear()),
      error: "Please enter a valid year.",
      render: text("year_founded", { type: "number", placeholder: "e.g. 1998" }),
    },
    {
      key: "team_size",
      title: "How many people work in the business?",
      optional: true,
      render: choices("team_size", TEAM_SIZES.map((s) => ({ value: s, label: s === "1" ? "Just me" : s }))),
    },
    specialtiesStep("What does your business specialise in?", "e.g. Calibrated sapphire parcels, unheated rubies"),
    bioStep("Tell buyers about your business"),
    {
      key: "website",
      title: "Does your business have a website?",
      optional: true,
      render: text("website", { type: "url", placeholder: "www.example.com" }),
    },
    {
      key: "full_name",
      title: "Who manages this account?",
      hint: "Your name and role — shown on the business profile as the contact person.",
      valid: (f) => !!f.full_name.trim(),
      error: "Please enter your name.",
      render: ({ form, set }) => (
        <div className="space-y-2">
          <Input placeholder="Full name" value={form.full_name} onChange={(e) => set("full_name", e.target.value)} className="h-12 text-base" />
          <Input placeholder="Role, e.g. Director" value={form.contact_role} onChange={(e) => set("contact_role", e.target.value)} className="h-12 text-base" />
        </div>
      ),
    },
    phoneStep("What's your business phone number?"),
    emailStep("Would you like to add a business email?"),
    photoStep("Add your business logo"),
  ];
}

/** One question per screen — order ends with the optional photo. */
export function buildSteps(accountType, traderKind) {
  if (accountType === "trader" && traderKind === "business") return businessSteps();

  const steps = [
    {
      key: "full_name",
      title: "What's your full name?",
      hint: "This is the name other traders and buyers will see.",
      valid: (f) => !!f.full_name.trim(),
      error: "Please enter your full name.",
      render: text("full_name", { autoFocus: true }),
    },
    {
      key: "business_name",
      title: "Do you trade under a business name?",
      hint: "Optional — leave it blank if you trade under your own name.",
      optional: true,
      render: text("business_name"),
    },
    {
      key: "country",
      title: "Which country are you based in?",
      render: ({ form, set }) => <CountrySelect value={form.country} onChange={(v) => set("country", v)} />,
    },
    { key: "city", title: "And which city?", optional: true, render: text("city") },
    {
      key: "years_experience",
      title: "How long have you been in this industry?",
      hint: "Just the number of years.",
      optional: true,
      render: text("years_experience", { type: "number", placeholder: "e.g. 8" }),
    },
  ];

  if (accountType === "trader") {
    steps.push(specialtiesStep("What do you specialise in?", "e.g. Ceylon blue sapphires, unheated padparadscha"));
  }

  steps.push(
    bioStep("Tell us a little about yourself"),
    phoneStep("What's your phone number?"),
    emailStep("Would you like to add a contact email?"),
    photoStep("Add a profile photo")
  );

  return steps;
}
