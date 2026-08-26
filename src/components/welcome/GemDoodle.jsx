import React from "react";

/**
 * Thin line-art version of the Gems24 mark — a faceted brilliant-cut stone,
 * drawn so it belongs to the same doodle family as the background pattern.
 */
export default function GemDoodle({ className = "" }) {
  return (
    <svg viewBox="0 0 100 100" className={className} fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinejoin="round" aria-hidden="true">
      <path d="M28 24h44l16 20-38 46L12 44Z" />
      <path d="M12 44h76" />
      <path d="M28 24 40 44 50 90 60 44 72 24" />
      <path d="M40 44h20" />
    </svg>
  );
}