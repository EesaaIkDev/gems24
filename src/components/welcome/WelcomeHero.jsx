import React from "react";
import { motion } from "framer-motion";
import GemPattern from "./GemPattern";

export default function WelcomeHero() {
  return (
    <section className="relative flex h-[47svh] min-h-[320px] max-h-[520px] items-center justify-center overflow-hidden bg-welcome-green">
      <GemPattern />
      <motion.div
        className="relative z-10 flex flex-col items-center"
        initial={{ opacity: 0, y: 14 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.15, duration: 0.5, ease: "easeOut" }}
      >
        <p className="font-display text-4xl font-bold tracking-tight text-welcome-ink sm:text-5xl">Gems24</p>
      </motion.div>
      {/* Faceted divider: a trapezium silhouette, as if the green were cut
          into the dark section by a single large gem facet. */}
      <svg aria-hidden="true" viewBox="0 0 390 84" preserveAspectRatio="none" className="absolute -bottom-px left-0 h-16 w-full sm:h-20">
        <path
          className="fill-welcome-ink"
          d="M0 76 96 56 294 56 390 76V84H0Z"
        />
        <path
          className="stroke-welcome-ink/25"
          fill="none"
          strokeWidth="1"
          d="M0 76 96 56M294 56 390 76"
        />
      </svg>
    </section>
  );
}