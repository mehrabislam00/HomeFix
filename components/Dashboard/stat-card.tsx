import type { LucideIcon } from "lucide-react"

import { BlurFade } from "@/components/magic/blur-fade"
import { cn } from "@/lib/utils"

const tones = {
  neutral: "bg-pale-sage text-forest",
  blue: "bg-status-requested-bg text-status-requested-fg",
  green: "bg-status-success-bg text-status-success-fg",
  amber: "bg-status-amber-bg text-status-amber-fg",
} as const

export function StatCard({
  label,
  value,
  hint,
  icon: Icon,
  tone = "neutral",
  delay = 0,
}: {
  label: string
  value: React.ReactNode
  hint?: string
  icon: LucideIcon
  tone?: keyof typeof tones
  delay?: number
}) {
  return (
    <BlurFade fade={false} delay={delay} y={14} className="flex h-full">
      <div className="glass-card group relative flex w-full flex-col gap-4 overflow-hidden rounded-3xl p-5 hover:-translate-y-1 motion-reduce:hover:translate-y-0">
        <div className="flex items-center justify-between gap-3">
          <p className="text-sm font-medium text-ink-soft">{label}</p>
          <span
            className={cn(
              "flex size-11 shrink-0 items-center justify-center rounded-2xl shadow-[inset_0_1px_1px_rgb(255_255_255/0.8)] ring-1 ring-forest/5 transition-transform duration-300 group-hover:scale-105 motion-reduce:transition-none",
              tones[tone]
            )}
          >
            <Icon aria-hidden strokeWidth={1.75} className="size-5" />
          </span>
        </div>
        <div className="min-w-0 leading-tight">
          <p className="truncate font-[family-name:var(--font-manrope)] text-3xl font-extrabold tracking-tight text-forest tabular-nums">
            {value}
          </p>
          <p className="mt-1.5 min-h-4 text-xs text-ink-muted">{hint}</p>
        </div>
      </div>
    </BlurFade>
  )
}