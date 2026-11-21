"use client";

import { animate, useReducedMotion } from "motion/react";
import { useEffect, useState } from "react";

/** Number ticker: counts from 0 to `to` once on mount. */
export function CountUp({
  to,
  decimals = 1,
  duration = 1.4,
  delay = 0.7,
}: {
  to: number;
  decimals?: number;
  duration?: number;
  delay?: number;
}) {
  const reduce = useReducedMotion();
  const [value, setValue] = useState(reduce ? to : 0);

  useEffect(() => {
    if (reduce) {
      setValue(to);
      return;
    }
    const controls = animate(0, to, {
      duration,
      delay,
      ease: "easeOut",
      onUpdate: setValue,
    });
    return () => controls.stop();
  }, [to, duration, delay, reduce]);

  return <span className="tabular-nums">{value.toFixed(decimals)}</span>;
}