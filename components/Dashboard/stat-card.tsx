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
      <div className="glass-card group relative flex w-full items-center gap-4 rounded-3xl p-5 hover:-translate-y-1 motion-reduce:hover:translate-y-0">
        <span
          className={cn(
            "flex size-12 shrink-0 items-center justify-center rounded-2xl shadow-[inset_0_1px_1px_rgb(255_255_255/0.8)] ring-1 ring-forest/5 transition-transform duration-300 group-hover:scale-105 motion-reduce:transition-none",
            tones[tone]
          )}
        >
          <Icon aria-hidden strokeWidth={1.75} className="size-6" />
        </span>
        <div className="min-w-0 leading-tight">
          <p className="text-sm text-ink-soft">{label}</p>
          <p className="mt-1 font-[family-name:var(--font-manrope)] text-3xl font-extrabold tracking-tight text-forest tabular-nums">
            {value}
          </p>
          {hint && <p className="mt-1 text-xs text-ink-muted">{hint}</p>}
        </div>
      </div>
    </BlurFade>
  )
}