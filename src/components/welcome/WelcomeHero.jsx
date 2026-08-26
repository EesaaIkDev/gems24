import React from "react";
import { motion } from "framer-motion";
import { Image } from "@/components/ui/image";
import { LOGO_URL } from "@/lib/gems";
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
        <Image src={LOGO_URL} alt="Gems24 logo" className="h-24 w-24 brightness-0 sm:h-28 sm:w-28" fittingType="fit" />
        <p className="mt-4 font-display text-4xl font-bold tracking-tight text-welcome-ink sm:text-5xl">Gems24</p>
      </motion.div>
      <svg aria-hidden="true" viewBox="0 0 390 72" preserveAspectRatio="none" className="absolute -bottom-px left-0 h-20 w-full fill-welcome-ink">
        <path d="M0 47C82 9 154 0 225 20c65 18 116 14 165-2v54H0Z" />
      </svg>
    </section>
  );
}