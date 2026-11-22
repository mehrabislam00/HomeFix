import type { LucideIcon } from "lucide-react"

export function EmptyState({
  icon: Icon,
  title,
  description,
  action,
}: {
  icon: LucideIcon
  title: string
  description: string
  action?: React.ReactNode
}) {
  return (
    <div className="relative flex flex-col items-center overflow-hidden rounded-3xl border border-dashed border-forest/20 bg-white/40 px-6 py-14 text-center">
      <div
        aria-hidden
        className="pointer-events-none absolute -top-16 left-1/2 size-48 -translate-x-1/2 rounded-full bg-sage/20 blur-3xl"
      />
      <span className="relative flex size-16 items-center justify-center rounded-2xl border border-white/80 bg-white/70 text-forest shadow-[inset_0_1px_0_rgb(255_255_255/0.95),0_14px_28px_-16px_rgb(38_58_50/0.45)]">
        <Icon aria-hidden strokeWidth={1.75} className="size-7" />
      </span>
      <h2 className="relative mt-5 font-[family-name:var(--font-manrope)] text-lg font-bold text-forest">
        {title}
      </h2>
      <p className="relative mt-1.5 max-w-sm text-sm text-ink-soft">
        {description}
      </p>
      {action && <div className="relative mt-6">{action}</div>}
    </div>
  )
}