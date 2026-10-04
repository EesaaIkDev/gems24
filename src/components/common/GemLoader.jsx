import React from "react";

export default function GemLoader({ className = "h-12 w-12", spinning = true, style }) {
  return <svg viewBox="0 0 100 100" className={`text-primary ${className}`} style={style} aria-hidden="true">
    <polygon fill="currentColor" points="39,36 61,36 68,48 50,66 32,48" />
    <path d="M39 36 44 48 50 66 56 48 61 36 M32 48H68 M44 48 50 36 56 48" fill="none" stroke="hsl(var(--background))" strokeWidth="1.5" />
    <g className={spinning ? "gem-loader-orbit" : ""}>
      <circle cx="50" cy="48" r="30" fill="none" stroke="currentColor" strokeWidth="5" />
      <path d="M72 70 87 85" stroke="currentColor" strokeWidth="6" strokeLinecap="round" />
    </g>
  </svg>;
}