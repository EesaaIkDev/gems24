import React from "react";
import { motion, useReducedMotion } from "framer-motion";

const SPRING = { type: "spring", stiffness: 420, damping: 40, mass: 0.9 };

/** iOS push/pop: new screens slide in from the right, back pops to the right. */
export default function PageTransition({ children, direction = 1 }) {
  const reduced = useReducedMotion();

  if (reduced) return <div>{children}</div>;

  return (
    <motion.div
      initial={{ x: `${direction * 28}%`, opacity: 0.4 }}
      animate={{ x: 0, opacity: 1 }}
      exit={{ x: `${direction * -18}%`, opacity: 0 }}
      transition={SPRING}
      style={{ willChange: "transform, opacity" }}
    >
      {children}
    </motion.div>
  );
}