import React from "react";
import useCountries from "@/hooks/useCountries";

/** Native select of country dial codes for phone numbers. */
export default function PhoneRegionSelect({ value, onChange }) {
  const { countries, loading } = useCountries();
  const withDial = countries.filter((c) => c.dial);

  return (
    <select
      value={value || ""}
      onChange={(e) => onChange(e.target.value)}
      className="h-11 w-24 shrink-0 rounded-md border border-input bg-background px-2 text-sm text-foreground"
    >
      <option value="">{loading ? "…" : "Code"}</option>
      {value && !withDial.some((c) => c.dial === value) && <option value={value}>{value}</option>}
      {withDial.map((c) => (
        <option key={c.code} value={c.dial}>
          {c.dial} {c.code}
        </option>
      ))}
    </select>
  );
}