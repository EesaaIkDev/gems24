import React from "react";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { countWords, limitWords } from "@/lib/words";
import CountrySelect from "./CountrySelect";
import PhoneRegionSelect from "./PhoneRegionSelect";
import PhotoStep from "./PhotoStep";

const SPECIALTY_WORD_LIMIT = 20;
const BIO_WORD_LIMIT = 70;

/** One question per screen — order ends with the optional photo. */
export function buildSteps(accountType) {
  const steps = [
    {
      key: "full_name",
      title: "What's your full name?",
      hint: "This is the name other traders and buyers will see.",
      valid: (f) => !!f.full_name.trim(),
      error: "Please enter your full name.",
      render: ({ form, set }) => (
        <Input autoFocus value={form.full_name} onChange={(e) => set("full_name", e.target.value)} className="h-12 text-base" />
      ),
    },
    {
      key: "business_name",
      title: "Do you trade under a business name?",
      hint: "Optional — leave it blank if you trade under your own name.",
      optional: true,
      render: ({ form, set }) => (
        <Input value={form.business_name} onChange={(e) => set("business_name", e.target.value)} className="h-12 text-base" />
      ),
    },
    {
      key: "country",
      title: "Which country are you based in?",
      render: ({ form, set }) => <CountrySelect value={form.country} onChange={(v) => set("country", v)} />,
    },
    {
      key: "city",
      title: "And which city?",
      optional: true,
      render: ({ form, set }) => (
        <Input value={form.city} onChange={(e) => set("city", e.target.value)} className="h-12 text-base" />
      ),
    },
    {
      key: "years_experience",
      title: "How long have you been in this industry?",
      hint: "Just the number of years.",
      optional: true,
      render: ({ form, set }) => (
        <Input
          type="number"
          placeholder="e.g. 8"
          value={form.years_experience}
          onChange={(e) => set("years_experience", e.target.value)}
          className="h-12 text-base"
        />
      ),
    },
  ];

  if (accountType === "trader") {
    steps.push({
      key: "specialties",
      title: "What do you specialise in?",
      hint: "Separate with commas.",
      optional: true,
      render: ({ form, set }) => (
        <>
          <Textarea
            rows={3}
            placeholder="e.g. Ceylon blue sapphires, unheated padparadscha"
            value={form.specialtiesText}
            onChange={(e) => set("specialtiesText", limitWords(e.target.value, SPECIALTY_WORD_LIMIT))}
          />
          <p className="mt-2 text-xs text-muted-foreground">
            {countWords(form.specialtiesText)}/{SPECIALTY_WORD_LIMIT} words
          </p>
        </>
      ),
    });
  }

  steps.push(
    {
      key: "bio",
      title: "Tell us a little about yourself",
      optional: true,
      render: ({ form, set }) => (
        <>
          <Textarea rows={5} value={form.bio} onChange={(e) => set("bio", limitWords(e.target.value, BIO_WORD_LIMIT))} />
          <p className="mt-2 text-xs text-muted-foreground">
            {countWords(form.bio)}/{BIO_WORD_LIMIT} words
          </p>
        </>
      ),
    },
    {
      key: "phone",
      title: "What's your phone number?",
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
    },
    {
      key: "contact_email",
      title: "Would you like to add a contact email?",
      hint: "Optional — messaging happens right here in Gems24 chat. This is only shown to traders you've accepted a connection with.",
      optional: true,
      render: ({ form, set }) => (
        <Input
          type="email"
          value={form.contact_email}
          onChange={(e) => set("contact_email", e.target.value)}
          className="h-12 text-base"
        />
      ),
    },
    {
      key: "profile_photo",
      title: "Add a profile photo",
      hint: "Optional — you can always add one later.",
      optional: true,
      render: ({ form, set }) => <PhotoStep value={form.profile_photo} onChange={(v) => set("profile_photo", v)} />,
    }
  );

  return steps;
}