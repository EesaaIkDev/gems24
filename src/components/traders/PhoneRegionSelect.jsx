import React from "react";
import useCountries from "@/hooks/useCountries";
import SheetSelect from "@/components/common/SheetSelect";

/** Dial codes labelled with the full country name, A–Z. */
export default function PhoneRegionSelect({ value, onChange }) {
  const { countries } = useCountries();
  const options = countries
    .filter((c) => c.dial)
    .slice()
    .sort((a, b) => a.name.localeCompare(b.name))
    .map((c) => ({ key: c.code, value: c.dial, label: `${c.dial} ${c.name}` }));

  return (
    <SheetSelect
      value={value || ""}
      onChange={onChange}
      options={options}
      placeholder="Select region"
      title="Phone region"
      className="px-2"
    />
  );
}