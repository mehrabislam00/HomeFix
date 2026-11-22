"use client"

import { cn } from "@/lib/utils"

export type SegmentedItem = { key: string; label: string; count?: number }

/** Pill-shaped tab filter used by every dashboard list. */
export function SegmentedFilter({
  items,
  value,
  onChange,
  label,
}: {
  items: SegmentedItem[]
  value: string
  onChange: (key: string) => void
  label: string
}) {
  return (
    <div
      role="group"
      aria-label={label}
      className="-mx-4 flex [scrollbar-width:none] gap-1 overflow-x-auto px-4 pb-1 sm:mx-0 sm:w-fit sm:overflow-visible sm:px-0 [&::-webkit-scrollbar]:hidden"
    >
      <div className="liquid-glass relative flex gap-1 rounded-full p-1">
        {items.map(({ key, label: text, count }) => {
          const active = key === value
          return (
            <button
              key={key}
              type="button"
              aria-pressed={active}
              onClick={() => onChange(key)}
              className={cn(
                "h-10 shrink-0 rounded-full px-4 text-sm font-medium whitespace-nowrap transition-all duration-200 focus-visible:outline-2 focus-visible:outline-sage motion-reduce:transition-none",
                active
                  ? "bg-forest text-white shadow-[inset_0_1px_0_rgb(255_255_255/0.2),0_6px_14px_-6px_rgb(38_58_50/0.6)]"
                  : "text-ink-soft hover:bg-forest/10 hover:text-forest"
              )}
            >
              {text}
              {count !== undefined && (
                <span className="ml-1.5 tabular-nums opacity-70">{count}</span>
              )}
            </button>
          )
        })}
      </div>
    </div>
  )
}