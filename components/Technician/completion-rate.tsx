import { BlurFade } from "@/components/magic/blur-fade"

/** Ring showing the share of non-cancelled jobs that were completed. */
export function CompletionRate({ percent }: { percent: number }) {
  const r = 34
  const c = 2 * Math.PI * r
  return (
    <BlurFade fade={false} delay={0.16} y={16}>
      <section className="glass-card relative rounded-[1.75rem] p-5 sm:p-7">
        <h2 className="font-[family-name:var(--font-manrope)] text-xl font-extrabold tracking-tight text-forest">
          Completion rate
        </h2>
        <div className="mt-4 flex items-center gap-5">
          <div className="relative size-24 shrink-0">
            <svg
              viewBox="0 0 80 80"
              role="img"
              aria-label={`${percent}% completion rate`}
              className="size-full -rotate-90"
            >
              <circle cx="40" cy="40" r={r} fill="none" strokeWidth="8" className="stroke-pale-sage" />
              <circle
                cx="40"
                cy="40"
                r={r}
                fill="none"
                strokeWidth="8"
                strokeLinecap="round"
                strokeDasharray={c}
                strokeDashoffset={c * (1 - percent / 100)}
                className="stroke-sage-deep transition-[stroke-dashoffset] duration-700 motion-reduce:transition-none"
              />
            </svg>
            <span className="absolute inset-0 flex items-center justify-center font-[family-name:var(--font-manrope)] text-xl font-extrabold text-forest tabular-nums">
              {percent}%
            </span>
          </div>
          <p className="text-sm text-ink-soft">
            Share of your non-cancelled bookings that reached completion.
          </p>
        </div>
      </section>
    </BlurFade>
  )
}