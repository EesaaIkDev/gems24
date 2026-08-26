import React from "react";
import { motion } from "framer-motion";
import { Image } from "@/components/ui/image";
import { LOGO_URL } from "@/lib/gems";

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
        <g fill="none" stroke="currentColor" strokeWidth="1.2">
          <path d="M28 48 47 29h28l19 19-33 39Z M47 29l14 58 14-58M28 48h66M47 29l14 19 14-19" />
          <path d="M286 38c18-13 43 1 39 23-3 19-27 33-27 33s-18-22-17-39c0-7 2-13 5-17Z M285 52l28 20M281 62l35-10" />
          <ellipse cx="177" cy="55" rx="27" ry="20" /><path d="M150 55h54M177 35l-14 20 14 20 14-20Z" />
          <path d="M22 155h73v45H22zM31 164h55v27H31zM40 173h8m10 0h8m10 0h2" />
          <path d="M296 143h42l12 17-33 42-33-42Z M296 143l21 59 21-59M284 160h66" />
          <path d="M41 272c0-17 15-31 33-31s33 14 33 31-33 50-33 50-33-33-33-50Z M48 265h52M74 241v81" />
          <path d="M285 254h68v42h-68zM294 263h50v24M302 272h8m9 0h8m9 0h2" />
          <path d="M26 373h66M59 347v26M39 355h40M34 373l-8 22h66l-8-22" />
        </g>
      </svg>
      <Image src={LOGO_URL} alt="" className="absolute left-[42%] top-[30%] h-14 w-14 -rotate-12 opacity-[0.15]" fittingType="fit" />
      <Image src={LOGO_URL} alt="" className="absolute -left-3 bottom-[10%] h-20 w-20 rotate-12 opacity-10" fittingType="fit" />
      <Image src={LOGO_URL} alt="" className="absolute -right-4 top-[49%] h-24 w-24 -rotate-6 opacity-10" fittingType="fit" />
    </motion.div>
  );
}