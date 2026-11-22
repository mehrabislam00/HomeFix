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
    <div className="flex flex-col items-center rounded-3xl border border-dashed border-forest/15 px-6 py-14 text-center">
      <span className="flex size-14 items-center justify-center rounded-2xl bg-pale-sage text-forest ring-1 ring-forest/10">
        <Icon aria-hidden strokeWidth={1.75} className="size-7" />
      </span>
      <h2 className="mt-5 font-[family-name:var(--font-manrope)] text-lg font-bold text-forest">
        {title}
      </h2>
      <p className="mt-1.5 max-w-sm text-sm text-ink-soft">{description}</p>
      {action && <div className="mt-6">{action}</div>}
    </div>
  )
}