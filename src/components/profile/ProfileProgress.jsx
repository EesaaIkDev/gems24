import React from "react";
import { Link } from "react-router-dom";
import { ChevronRight } from "lucide-react";

// Creating an account is already real progress, so the meter opens at 25%.
const BASE = 25;

const STEPS = [
  { key: "profile_photo", label: "Add a profile photo", done: (t) => !!t.profile_photo },
  { key: "business_name", label: "Add your business name", done: (t) => !!t.business_name },
  { key: "specialties", label: "Pick your specialties", done: (t) => (t.specialties || []).length > 0 },
  { key: "country", label: "Add your location", done: (t) => !!t.country },
  { key: "bio", label: "Write a short bio", done: (t) => !!t.bio },
  { key: "contact", label: "Add contact details", done: (t) => !!(t.phone || t.contact_email) },
];

export default function ProfileProgress({ trader }) {
  const done = STEPS.filter((s) => s.done(trader));
  const percent = Math.round(BASE + ((100 - BASE) * done.length) / STEPS.length);
  const next = STEPS.find((s) => !s.done(trader));

  return (
    <Link to="/settings" className="block rounded-2xl bg-card p-4">
      <div className="flex items-baseline justify-between">
        <h2 className="text-sm font-semibold">Profile strength</h2>
        <span className="font-heading text-sm font-bold text-primary tabular-nums">{percent}%</span>
      </div>
      <div className="neu-inset-sm mt-2.5 h-2 w-full overflow-hidden rounded-full bg-background">
        <div className="h-full rounded-full bg-primary transition-all duration-500" style={{ width: `${percent}%` }} />
      </div>
      <div className="mt-2.5 flex items-center gap-1 text-xs text-muted-foreground">
        <span className="truncate">
          {next ? `Next: ${next.label}` : "Your profile is complete — buyers see the full picture."}
        </span>
        {next && <ChevronRight className="ml-auto h-3.5 w-3.5 shrink-0" />}
      </div>
    </Link>
  );
}