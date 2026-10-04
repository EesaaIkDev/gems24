import React from "react";
import { Bold, Italic, List } from "lucide-react";
const FORMATS = [{ icon: Bold, label: "Bold", wrap: "**" }, { icon: Italic, label: "Italic", wrap: "*" }, { icon: List, label: "List", list: true }];
export default function FormattingToolbar({ onApply }) {
  return <div className="flex items-center gap-1 pb-1.5">
    {FORMATS.map((format) => <button key={format.label} type="button" aria-label={format.label}
      onPointerDown={(e) => e.preventDefault()} onClick={() => onApply(format)}
      className="flex h-11 w-11 items-center justify-center rounded-lg text-muted-foreground hover:text-primary">
      <format.icon className="h-4 w-4" />
    </button>)}
    <span className="ml-auto hidden sm:block text-[0.6875rem] text-muted-foreground">Enter to send · Shift + Enter for new line</span>
  </div>;
}