import React from "react";
import useCountries from "@/hooks/useCountries";

/** Dial codes labelled with the full country name, A–Z. */
export default function PhoneRegionSelect({ value, onChange }) {
  const { countries } = useCountries();
  const withDial = countries
    .filter((c) => c.dial)
    .slice()
    .sort((a, b) => a.name.localeCompare(b.name));

  return (
    <select
      value={value || ""}
      onChange={(e) => onChange(e.target.value)}
      className="h-11 w-full min-w-0 rounded-md border border-input bg-background px-2 text-sm text-foreground"
    >
      <option value="">Select region</option>
      {value && !withDial.some((c) => c.dial === value) && <option value={value}>{value}</option>}
      {withDial.map((c) => (
        <option key={c.code} value={c.dial}>
          {c.dial} {c.name}
        </option>
      ))}
    </select>
  );
}