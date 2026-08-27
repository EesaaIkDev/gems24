import React from "react";
import { motion } from "framer-motion";

/** Background doodles — nothing but a variety of gemstone cuts, drawn as line art. */
export default function GemPattern() {
  return (
    <motion.div
      aria-hidden="true"
      className="absolute inset-0 text-welcome-text/70"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.7 }}
    >
      <svg viewBox="0 0 390 430" className="absolute inset-0 h-full w-full">
        <g fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinejoin="round">
          {/* Small, widely spaced cuts frame a clear central wordmark area. */}
          <g transform="translate(32 38)"><circle r="13" /><path d="m-9-9 6 7h6l6-7M-13 0h26M-9 9l6-7h6l6 7" /></g>
          <g transform="translate(116 24)"><path d="m-10-7 4-5H6l4 5v14l-4 5H-6l-4-5Z" /><path d="M-5-7H5V7H-5Z" /></g>
          <g transform="translate(252 38)"><path d="m0-13 11 8-4 14H-7l-4-14Z" /><path d="M-7-5 0 7l7-12" /></g>
          <g transform="translate(354 70)"><ellipse rx="10" ry="13" /><path d="M-10 0h20M0-13v26" /></g>

          <g transform="translate(70 112)"><path d="m0-12 11 8-4 14H-7l-4-14Z" /></g>
          <g transform="translate(166 84)"><path d="m-10-7 4-5H6l4 5v14l-4 5H-6l-4-5Z" /><path d="M-5-7H5V7H-5Z" /></g>
          <g transform="translate(306 118)"><circle r="12" /><path d="M-12 0h24M0-12v24" /></g>
          <circle cx="22" cy="169" r="2" fill="currentColor" stroke="none" />
          <circle cx="366" cy="172" r="2" fill="currentColor" stroke="none" />

          <g transform="translate(38 225)"><ellipse rx="10" ry="13" /><path d="M-10 0h20M0-13v26" /></g>
          <g transform="translate(348 226)"><path d="m0-13 12 9-5 14H-7l-5-14Z" /><path d="M-7-4 0 8l7-12" /></g>
          <circle cx="76" cy="286" r="2" fill="currentColor" stroke="none" />
          <circle cx="314" cy="286" r="2" fill="currentColor" stroke="none" />

          <g transform="translate(56 338)"><circle r="13" /><path d="m-9-9 6 7h6l6-7M-13 0h26M-9 9l6-7h6l6 7" /></g>
          <g transform="translate(142 372)"><path d="m-10-7 4-5H6l4 5v14l-4 5H-6l-4-5Z" /><path d="M-5-7H5V7H-5Z" /></g>
          <g transform="translate(270 350)"><ellipse rx="10" ry="14" /><path d="M-10 0h20M0-14v28" /></g>
          <g transform="translate(352 382)"><path d="m0-13 12 9-5 14H-7l-5-14Z" /></g>
          <circle cx="24" cy="404" r="2" fill="currentColor" stroke="none" />
          <circle cx="226" cy="402" r="2" fill="currentColor" stroke="none" />
        </g>
      </svg>
    </motion.div>
  );
}