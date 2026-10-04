import React from "react";

export default function GemLoader({ className = "h-12 w-12", spinning = true, style }) {
  return <svg viewBox="0 0 100 100" className={`text-primary ${className}`} style={style} aria-hidden="true">
    <polygon fill="currentColor" points="34.3,31.4 54.8,31.4 63.2,41.2 44.5,63.2 25.9,41.2" />
    <g className={spinning ? "gem-loader-orbit" : ""}>
      <circle cx="44.5" cy="46.2" r="27.7" fill="none" stroke="currentColor" strokeWidth="5.5" />
      <path d="M65.8 67.5 82.6 80.9" stroke="currentColor" strokeWidth="7" strokeLinecap="round" />
    </g>
  </svg>;
}