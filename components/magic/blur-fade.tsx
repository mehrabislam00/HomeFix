"use client";

import { motion, useReducedMotion } from "motion/react";
import type { ReactNode } from "react";

/**
 * BlurFade (Magic UI style): fades + lifts content in. Use `delay` to stagger.
 * `blur` is 0 by default — a CSS filter on an ancestor would break the
 * backdrop-filter of any liquid-glass element inside, so only blur plain text.
 */
export function BlurFade({
  children,
  className,
  delay = 0,
  duration = 0.6,
  y = 14,
  blur = 0,
}: {
  children: ReactNode;
  className?: string;
  delay?: number;
  duration?: number;
  y?: number;
  blur?: number;
}) {
  const reduce = useReducedMotion();

  return (
    <motion.div
      className={className}
      initial={
        reduce
          ? false
          : { opacity: 0, y, ...(blur ? { filter: `blur(${blur}px)` } : {}) }
      }
      animate={{ opacity: 1, y: 0, ...(blur ? { filter: "blur(0px)" } : {}) }}
      transition={{ delay, duration, ease: [0.22, 1, 0.36, 1] }}
    >
      {children}
    </motion.div>
  );
}