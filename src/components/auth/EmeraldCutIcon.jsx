import React from "react";
import { EmeraldCut } from "@/components/welcome/gemCuts";

/** Hand-drawn emerald-cut gem, in the same line style as the welcome pattern. */
export default function EmeraldCutIcon({ className, ...props }) {
  return (
    <svg viewBox="-20 -20 40 40" className={className} fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinejoin="round" strokeLinecap="round" {...props}>
      <EmeraldCut />
    </svg>
  );
}