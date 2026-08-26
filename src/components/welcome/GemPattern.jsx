import React from "react";
import { motion } from "framer-motion";

export default function GemPattern() {
  return (
    <motion.svg
      aria-hidden="true"
      viewBox="0 0 390 430"
      className="absolute inset-0 h-full w-full text-welcome-pattern"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.7 }}
    >
      <g fill="none" stroke="currentColor" strokeWidth="1.2">
        <path d="M28 48 47 29h28l19 19-33 39Z M47 29l14 58 14-58M28 48h66M47 29l14 19 14-19" />
        <path d="M286 38c18-13 43 1 39 23-3 19-27 33-27 33s-18-22-17-39c0-7 2-13 5-17Z M285 52l28 20M281 62l35-10" />
        <ellipse cx="177" cy="55" rx="27" ry="20" /><path d="M150 55h54M177 35l-14 20 14 20 14-20Z" />
        <path d="M22 155h73v45H22zM31 164h55v27H31zM40 173h8m10 0h8m10 0h2" />
        <path d="M296 143h42l12 17-33 42-33-42Z M296 143l21 59 21-59M284 160h66" />
        <circle cx="193" cy="165" r="25" /><path d="m211 183 24 24M177 149l32 32M177 181l32-32" />
        <path d="M41 272c0-17 15-31 33-31s33 14 33 31-33 50-33 50-33-33-33-50Z M48 265h52M74 241v81" />
        <path d="M285 254h68v42h-68zM294 263h50v24M302 272h8m9 0h8m9 0h2" />
        <path d="M155 274h44l14 17-36 47-36-47Z M155 274l22 64 22-64M141 291h72" />
        <path d="M26 373h66M59 347v26M39 355h40M34 373l-8 22h66l-8-22" />
        <path d="M277 364h38l17 20-36 39-36-39Z M277 364l19 59 19-59M260 384h72" />
        <path d="M146 390c0-13 12-24 27-24s27 11 27 24-27 38-27 38-27-25-27-38Z" />
      </g>
    </motion.svg>
  );
}