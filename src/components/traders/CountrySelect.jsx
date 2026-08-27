import React from "react";
import useCountries from "@/hooks/useCountries";

/** Native select of world countries — reliable and fast on mobile. */
export default function CountrySelect({ value, onChange }) {
  const { countries } = useCountries();

  return (
    <select
      value={value || ""}
      onChange={(e) => onChange(e.target.value)}
      className="h-11 w-full rounded-md border border-input bg-background px-3 text-sm text-foreground"
    >
      <option value="">Select country</option>
      {value && !countries.some((c) => c.name === value) && <option value={value}>{value}</option>}
      {countries.map((c) => (
        <option key={c.code} value={c.name}>
          {c.name}
        </option>
      ))}
    </select>
  );
}