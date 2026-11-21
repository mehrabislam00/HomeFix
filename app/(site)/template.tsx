"use client";

import { motion, useReducedMotion } from "motion/react";

/**
 * Page transition for the public site. A template (unlike a layout) re-mounts on every
 * navigation, so each page eases in while the Navbar and Footer in layout.tsx stay put.
 *
 * The "fade" is an ivory veil fading OUT on top of the page rather than the page's own
 * opacity: an ancestor with opacity < 1 would stop the glass cards' backdrop-filter from
 * blurring until the fade ends. The slight lift uses transform only, which is safe.
 */
export default function SiteTemplate({ children }: { children: React.ReactNode }) {
  const reduce = useReducedMotion();
  if (reduce) return <>{children}</>;

  return (
    <motion.div
      className="relative"
      initial={{ y: 12 }}
      animate={{ y: 0 }}
      transition={{ duration: 0.4, ease: [0.22, 1, 0.36, 1] }}
    >
      {children}
      <motion.div
        aria-hidden
        className="pointer-events-none absolute inset-0 z-40 bg-ivory"
        initial={{ opacity: 1 }}
        animate={{ opacity: 0 }}
        transition={{ duration: 0.3, ease: "easeOut" }}
      />
    </motion.div>
  );
}