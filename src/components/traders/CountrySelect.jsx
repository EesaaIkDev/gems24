import React from "react";
import useCountries from "@/hooks/useCountries";
import SheetSelect from "@/components/common/SheetSelect";

/** World countries, picked from a searchable bottom sheet. */
export default function CountrySelect({ value, onChange }) {
  const { countries } = useCountries();
  const options = countries.map((c) => ({ key: c.code, value: c.name, label: c.name }));

  return (
    <SheetSelect value={value || ""} onChange={onChange} options={options} placeholder="Select country" title="Country" />
  );
}