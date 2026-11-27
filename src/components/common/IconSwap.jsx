import React from "react";
import { AnimatePresence, motion } from "framer-motion";

/** Cross-fades between two icons with a short blur so the swap feels smooth. */
export default function IconSwap({ show, on, off, className = "" }) {
  return (
    <span className={`relative inline-flex ${className}`}>
      <AnimatePresence mode="popLayout" initial={false}>
        <motion.span
          key={show ? "on" : "off"}
          className="inline-flex"
          initial={{ opacity: 0, scale: 0.6, filter: "blur(4px)" }}
          animate={{ opacity: 1, scale: 1, filter: "blur(0px)" }}
          exit={{ opacity: 0, scale: 0.6, filter: "blur(4px)" }}
          transition={{ duration: 0.18, ease: "easeOut" }}
        >
          {show ? on : off}
        </motion.span>
      </AnimatePresence>
    </span>
  );
}