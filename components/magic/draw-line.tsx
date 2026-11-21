"use client";

import { motion, useReducedMotion } from "motion/react";

/**
 * A dashed connector that draws itself when scrolled into view.
 * Give it position + border classes (e.g. `absolute border-t-2 border-dashed`).
 */
export function DrawLine({
  className,
  axis = "x",
  delay = 0.3,
  duration = 1.2,
}: {
  className?: string;
  axis?: "x" | "y";
  delay?: number;
  duration?: number;
}) {
  const reduce = useReducedMotion();
  const from = axis === "x" ? { scaleX: 0 } : { scaleY: 0 };
  const to = axis === "x" ? { scaleX: 1 } : { scaleY: 1 };

  return (
    <motion.span
      aria-hidden
      className={className}
      style={{ transformOrigin: axis === "x" ? "left center" : "center top" }}
      initial={reduce ? false : from}
      whileInView={to}
      viewport={{ once: true, margin: "-80px" }}
      transition={{ delay, duration, ease: [0.22, 1, 0.36, 1] }}
    />
  );
}