import React from "react";
import { Link } from "react-router-dom";
import { Checkbox } from "@/components/ui/checkbox";

const Row = ({ id, checked, onChange, children }) => (
  <label htmlFor={id} className="flex cursor-pointer items-start gap-3">
    <Checkbox id={id} checked={checked} onCheckedChange={(v) => onChange(!!v)} className="mt-0.5" />
    <span className="text-[0.8125rem] leading-snug text-muted-foreground">{children}</span>
  </label>
);

/** Terms, Privacy and age confirmation — all unchecked by default, all required. */
export default function ConsentChecks({ value, onChange }) {
  const set = (k) => (v) => onChange({ ...value, [k]: v });

  return (
    <div className="space-y-3">
      <Row id="consent-terms" checked={value.terms} onChange={set("terms")}>
        I agree to the{" "}
        <Link to="/terms" target="_blank" className="font-medium text-primary hover:underline">
          Terms of Service
        </Link>
        .
      </Row>
      <Row id="consent-privacy" checked={value.privacy} onChange={set("privacy")}>
        I agree to the{" "}
        <Link to="/privacy" target="_blank" className="font-medium text-primary hover:underline">
          Privacy Policy
        </Link>
        .
      </Row>
      <p className="text-xs leading-snug text-muted-foreground">
        By creating an account on Gems24 you confirm to be of a mature age.
      </p>
    </div>
  );
}