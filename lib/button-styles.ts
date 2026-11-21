/**
 * Shared button look for HomeFix. Every button gets the same flex centering,
 * radius, weight and line-height so text + icons always sit on one baseline.
 * Use together with shadcn's <Button> (works with `asChild` + <Link> too).
 */
const base =
  "inline-flex items-center justify-center gap-2 rounded-xl text-sm font-semibold leading-none whitespace-nowrap " +
  "transition-all duration-200 hover:-translate-y-px active:translate-y-0 active:scale-[0.98] " +
  "focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-sage";

export const btn = {
  /** 40px — navbar, inline actions */
  md: `${base} h-10 px-5`,
  /** 48px — hero CTAs */
  lg: `${base} h-12 px-6`,

  primary:
    "bg-forest text-white hover:bg-forest-hover " +
    "shadow-[inset_0_1px_0_rgb(255_255_255/0.18),0_8px_18px_-8px_rgb(38_58_50/0.55)] " +
    "hover:shadow-[inset_0_1px_0_rgb(255_255_255/0.18),0_12px_24px_-8px_rgb(38_58_50/0.6)]",
  secondary: "bg-field text-forest hover:bg-line",
  outline:
    "border border-line-strong bg-transparent text-forest hover:bg-forest/5",
  ghost: "bg-transparent text-ink hover:bg-forest/5",
} as const;