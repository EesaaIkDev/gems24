import React, { useEffect, useState } from "react";
import { Switch } from "@/components/ui/switch";

export default function PreferenceSwitch({ checked, onSave, label }) {
  const [value, setValue] = useState(checked);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  useEffect(() => setValue(checked), [checked]);
  const change = async (next) => {
    if (busy) return;
    const previous = value;
    setValue(next);
    setBusy(true);
    setError("");
    try {
      await onSave(next);
    } catch {
      setValue(previous);
      setError("Couldn't save. Please try again.");
    } finally {
      setBusy(false);
    }
  };
  return <div className="flex shrink-0 flex-col items-end gap-2">
    <Switch aria-label={label} aria-busy={busy} checked={value} disabled={busy} onCheckedChange={change} />
    {error && <p role="alert" className="max-w-28 text-right text-xs text-destructive">{error}</p>}
  </div>;
}