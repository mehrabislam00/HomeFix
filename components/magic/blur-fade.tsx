"use client";

import { motion, useReducedMotion } from "motion/react";
import type { ReactNode } from "react";

/**
 * BlurFade (Magic UI style): fades + lifts content in. Use `delay` to stagger.
 * - `inView`: wait until the element scrolls into view (for sections below the fold).
 * - `fade={false}` skips the opacity animation (slide only). Use it around any element that
 *   has a `backdrop-filter`: an ancestor with opacity < 1 becomes a "backdrop root", so the
 *   blur can't see the page behind it until the fade finishes — it looks like the blur
 *   "pops in" late.
 * - `blur` is 0 by default — a CSS filter on an ancestor would break the
 *   backdrop-filter of any liquid-glass element inside, so only blur plain text.
 */
export function BlurFade({
  children,
  className,
  delay = 0,
  duration = 0.6,
  y = 14,
  blur = 0,
  inView = false,
  fade = true,
}: {
  children: ReactNode;
  className?: string;
  delay?: number;
  duration?: number;
  y?: number;
  blur?: number;
  inView?: boolean;
  fade?: boolean;
}) {
  const reduce = useReducedMotion();

  const hidden = { ...(fade ? { opacity: 0 } : {}), y, ...(blur ? { filter: `blur(${blur}px)` } : {}) };
  const shown = { ...(fade ? { opacity: 1 } : {}), y: 0, ...(blur ? { filter: "blur(0px)" } : {}) };
  const transition = { delay, duration, ease: [0.22, 1, 0.36, 1] as const };

  if (inView) {
    return (
      <motion.div
        className={className}
        initial={reduce ? false : hidden}
        whileInView={shown}
        viewport={{ once: true, margin: "-60px" }}
        transition={transition}
      >
        {children}
      </motion.div>
    );
  }

  return (
    <motion.div
      className={className}
      initial={reduce ? false : hidden}
      animate={shown}
      transition={transition}
    >
      {children}
    </motion.div>
  );
}