import React, { useMemo, useState } from "react";
import { motion } from "framer-motion";
import { ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";
import { detectCountry } from "@/lib/locale";
import { buildSteps } from "./profileSteps";

/** Splits a stored phone into a dial code and the local number. */
function splitPhone(phone = "") {
  const match = phone.trim().match(/^(\+\d{1,4})\s*(.*)$/);
  return match ? { code: match[1], number: match[2] } : { code: "", number: phone };
}

export default function ProfileWizard({ initial = {}, accountType, onSave, saving, submitLabel = "Save profile", onExit }) {
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
    specialtiesText: (initial.specialties || []).join(", "),
    phoneCode: initialPhone.code,
    phoneNumber: initialPhone.number,
  });
  const [index, setIndex] = useState(0);
  const [error, setError] = useState("");

  const steps = useMemo(() => buildSteps(accountType), [accountType]);
  const step = steps[index];
  const isLast = index === steps.length - 1;
  const progress = Math.round(((index + 1) / steps.length) * 100);

  const set = (k, v) => {
    setError("");
    setForm((f) => ({ ...f, [k]: v }));
  };

  const back = () => (index === 0 ? onExit?.() : setIndex(index - 1));

  const next = () => {
    if (step.valid && !step.valid(form)) {
      setError(step.error || "Please complete this step.");
      return;
    }
    if (!isLast) return setIndex(index + 1);
    onSave({
      full_name: form.full_name,
      business_name: form.business_name,
      profile_photo: form.profile_photo,
      country: form.country,
      city: form.city,
      bio: form.bio,
      contact_email: form.contact_email,
      specialties: form.specialtiesText.split(",").map((s) => s.trim()).filter(Boolean),
      phone: form.phoneNumber.trim() ? `${form.phoneCode} ${form.phoneNumber.trim()}`.trim() : "",
      years_experience: form.years_experience === "" ? undefined : Number(form.years_experience),
    });
  };

  return (
    <div className="flex flex-col">
      <button onClick={back} className="inline-flex items-center gap-1.5 self-start text-sm text-muted-foreground hover:text-primary">
        <ArrowLeft className="h-4 w-4" /> Back
      </button>

      <div className="mt-4 flex items-center gap-3">
        <div className="neu-inset-sm h-2 flex-1 overflow-hidden rounded-full bg-background">
          <motion.div
            className="h-full rounded-full bg-primary"
            animate={{ width: `${progress}%` }}
            transition={{ duration: 0.3, ease: "easeOut" }}
          />
        </div>
        <span className="text-xs font-medium text-muted-foreground">
          {index + 1}/{steps.length}
        </span>
      </div>

      <motion.div key={step.key} initial={{ opacity: 0, x: 16 }} animate={{ opacity: 1, x: 0 }} transition={{ duration: 0.25 }} className="mt-7">
        <h2 className="text-[1.375rem] font-bold leading-snug">{step.title}</h2>
        {step.hint && <p className="mt-1.5 text-sm text-muted-foreground">{step.hint}</p>}
        <div className="mt-5">{step.render({ form, set })}</div>
      </motion.div>

      {error && <p className="mt-3 text-sm text-destructive">{error}</p>}

      <Button onClick={next} disabled={saving} className="mt-8 h-12 w-full text-base font-semibold">
        {saving ? "Saving…" : isLast ? submitLabel : "Continue"}
      </Button>
      {step.optional && !isLast && (
        <button onClick={next} className="mt-3 text-sm text-muted-foreground hover:text-primary">
          Skip for now
        </button>
      )}
    </div>
  );
}