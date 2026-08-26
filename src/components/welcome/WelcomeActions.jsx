import React from "react";
import { motion } from "framer-motion";
import { Link } from "react-router-dom";

const reveal = { hidden: { opacity: 0, y: 14 }, visible: { opacity: 1, y: 0 } };

export default function WelcomeActions() {
  return (
    <motion.section initial="hidden" animate="visible" className="mx-auto flex w-full max-w-md flex-col px-6 pb-8 pt-5 text-center sm:px-8">
      <motion.h1 variants={reveal} transition={{ delay: 0.3, duration: 0.45 }} className="text-balance font-heading text-[2rem] font-bold leading-[1.08] text-welcome-text sm:text-4xl">
        Your <span className="text-welcome-green">Gemstone Network</span>, Connected.
      </motion.h1>
      <motion.p variants={reveal} transition={{ delay: 0.42, duration: 0.4 }} className="mx-auto mt-4 max-w-sm text-base leading-relaxed text-welcome-muted">
        Discover gems. Connect with traders. Grow your business.
      </motion.p>
      <motion.div variants={reveal} transition={{ delay: 0.56, duration: 0.4 }} className="mt-7 space-y-3">
        <Link to="/onboarding" className="flex min-h-14 w-full cursor-pointer items-center justify-center rounded-full bg-welcome-green px-6 font-heading text-base font-bold text-welcome-ink shadow-lg transition-[background-color,opacity] duration-200 hover:bg-welcome-green-bright active:opacity-80 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-welcome-green focus-visible:ring-offset-2 focus-visible:ring-offset-welcome-ink">
          Get Started
        </Link>
        <Link to="/login" className="flex min-h-14 w-full cursor-pointer items-center justify-center rounded-full border border-welcome-border bg-welcome-panel px-6 font-heading text-base font-semibold text-welcome-text transition-[background-color,border-color] duration-200 hover:bg-welcome-border focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-welcome-green focus-visible:ring-offset-2 focus-visible:ring-offset-welcome-ink">
          Sign In
        </Link>
      </motion.div>
      <motion.p variants={reveal} transition={{ delay: 0.66, duration: 0.35 }} className="mt-5 text-sm leading-relaxed text-welcome-subtle">
        The marketplace built for the global gemstone trade.
      </motion.p>
    </motion.section>
  );
}