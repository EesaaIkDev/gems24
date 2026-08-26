import React from "react";
import { motion } from "framer-motion";

/** Background doodles — nothing but a variety of gemstone cuts, drawn as line art. */
export default function GemPattern() {
  return (
    <motion.div
      aria-hidden="true"
      className="absolute inset-0 text-welcome-pattern"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.7 }}
    >
      <svg viewBox="0 0 390 430" className="absolute inset-0 h-full w-full">
        <g fill="none" stroke="currentColor" strokeWidth="1.2" strokeLinejoin="round">
          {/* Round brilliant */}
          <g>
            <circle cx="58" cy="52" r="26" />
            <path d="M40 34l9 12h18l9-12M32 52h52M40 70l9-12h18l9 12M49 46l9 12 9-12" />
          </g>
          {/* Emerald cut */}
          <g>
            <path d="M290 30h44l12 14v34l-12 14h-44l-12-14V44Z" />
            <path d="M296 40h32v48h-32zM278 44l18-4M346 44l-18-4M278 78l18 4M346 78l-18 4" />
          </g>
          {/* Pear */}
          <g>
            <path d="M177 32c14 14 22 26 22 38a22 22 0 0 1-44 0c0-12 8-24 22-38Z" />
            <path d="M155 70h44M177 32v60M163 52h28" />
          </g>
          {/* Marquise */}
          <g>
            <path d="M58 150c18 12 26 24 26 32s-8 20-26 32c-18-12-26-24-26-32s8-20 26-32Z" />
            <path d="M32 182h52M58 150v64M44 166h28M44 198h28" />
          </g>
          {/* Cushion */}
          <g>
            <path d="M300 148h30a16 16 0 0 1 16 16v26a16 16 0 0 1-16 16h-30a16 16 0 0 1-16-16v-26a16 16 0 0 1 16-16Z" />
            <path d="M296 162h38v28h-38M284 164l12-2M346 164l-12-2M284 190l12 2M346 190l-12 2" />
          </g>
          {/* Trillion */}
          <g>
            <path d="M74 258 108 314H40Z" />
            <path d="M74 258v56M52 296h44M60 278h28" />
          </g>
          {/* Oval */}
          <g>
            <ellipse cx="318" cy="286" rx="24" ry="32" />
            <path d="M294 286h48M318 254v64M302 268h32M302 304h32" />
          </g>
          {/* Heart */}
          <g>
            <path d="M60 400c-16-12-28-22-28-34a16 16 0 0 1 28-10 16 16 0 0 1 28 10c0 12-12 22-28 34Z" />
            <path d="M32 366h56M60 356v44M46 380h28" />
          </g>
          {/* Asscher */}
          <g>
            <path d="M300 366h36l12 12v28l-12 12h-36l-12-12v-28Z" />
            <path d="M306 378h24v36h-24M288 378l18 0M348 378l-18 0" />
          </g>
        </g>
      </svg>
    </motion.div>
  );
}