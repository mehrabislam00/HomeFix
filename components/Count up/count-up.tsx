"use client";

import { animate, useInView, useReducedMotion } from "motion/react";
import { useEffect, useRef, useState } from "react";

/** Number ticker: counts from 0 to `to` once on mount — or, with `inView`, once scrolled into view. */
export function CountUp({
  to,
  decimals = 1,
  duration = 1.4,
  delay = 0.7,
  inView = false,
}: {
  to: number;
  decimals?: number;
  duration?: number;
  delay?: number;
  inView?: boolean;
}) {
  const reduce = useReducedMotion();
  const ref = useRef<HTMLSpanElement>(null);
  const visible = useInView(ref, { once: true, margin: "-60px" });
  const [value, setValue] = useState(0);

  useEffect(() => {
    if (reduce) {
      return;
    }
    if (inView && !visible) return;
    const controls = animate(0, to, {
      duration,
      delay,
      ease: "easeOut",
      onUpdate: setValue,
    });
    return () => controls.stop();
  }, [to, duration, delay, reduce, inView, visible]);

  return (
    <span ref={ref} className="tabular-nums">
      {(reduce ? to : value).toFixed(decimals)}
    </span>
  );
}