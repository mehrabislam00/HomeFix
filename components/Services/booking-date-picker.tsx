"use client"

import { useState } from "react"
import { format, startOfDay } from "date-fns"
import { CalendarDays } from "lucide-react"

import { Calendar } from "@/components/ui/calendar"
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover"
import { cn } from "@/lib/utils"

/**
 * Date field for booking. Past dates are disabled. Emits an ISO yyyy-MM-dd string
 * through `onChange` (and a hidden input named `name` for native form posts).
 */
export function BookingDatePicker({
  id,
  name = "date",
  value,
  onChange,
  error,
}: {
  id?: string
  name?: string
  value: Date | undefined
  onChange: (date: Date | undefined) => void
  error?: string
}) {
  const [open, setOpen] = useState(false)
  const today = startOfDay(new Date())

  return (
    <div>
      <Popover open={open} onOpenChange={setOpen}>
        <PopoverTrigger
          id={id}
          aria-invalid={error ? true : undefined}
          aria-label={
            value
              ? `Preferred date: ${format(value, "PPPP")}`
              : "Choose a preferred date"
          }
          className={cn(
            "flex h-12 w-full items-center gap-3 rounded-xl border border-line-strong bg-surface px-3.5 text-left text-base shadow-[0_1px_2px_rgb(38_58_50/0.05)] transition outline-none",
            "hover:border-sage focus-visible:border-sage focus-visible:ring-4 focus-visible:ring-sage/20 data-popup-open:border-sage data-popup-open:ring-4 data-popup-open:ring-sage/20",
            error && "border-status-rejected-fg/60"
          )}
        >
          <CalendarDays aria-hidden className="size-4 shrink-0 text-forest" />
          <span
            className={cn(
              "flex-1 truncate",
              value ? "text-ink" : "text-ink-soft/60"
            )}
          >
            {value ? format(value, "EEE, d MMM yyyy") : "Select a date"}
          </span>
        </PopoverTrigger>

        <PopoverContent
          align="start"
          sideOffset={8}
          className="w-auto gap-0 rounded-3xl border border-white/70 bg-surface/90 p-4 shadow-[inset_0_1px_0_rgb(255_255_255/0.95),0_2px_4px_rgb(38_58_50/0.06),0_28px_60px_-20px_rgb(38_58_50/0.45)] ring-1 ring-forest/10 backdrop-blur-xl"
        >
          <Calendar
            mode="single"
            selected={value}
            onSelect={(d) => {
              onChange(d)
              if (d) setOpen(false)
            }}
            defaultMonth={value ?? today}
            startMonth={today}
            disabled={{ before: today }}
            autoFocus
          />
          <div className="mt-3 flex items-center justify-between border-t border-forest/10 pt-3 text-sm font-semibold">
            <button
              type="button"
              onClick={() => {
                onChange(undefined)
                setOpen(false)
              }}
              className="rounded-lg px-2 py-1.5 text-ink-soft transition-colors hover:bg-forest/10 hover:text-forest focus-visible:outline-2 focus-visible:outline-sage"
            >
              Clear
            </button>
            <button
              type="button"
              onClick={() => {
                onChange(today)
                setOpen(false)
              }}
              className="rounded-lg px-2 py-1.5 text-forest transition-colors hover:bg-forest/10 focus-visible:outline-2 focus-visible:outline-sage"
            >
              Today
            </button>
          </div>
        </PopoverContent>
      </Popover>
      <input
        type="hidden"
        name={name}
        value={value ? format(value, "yyyy-MM-dd") : ""}
      />
      {error && (
        <p
          role="alert"
          className="mt-1.5 text-xs font-medium text-status-rejected-fg"
        >
          {error}
        </p>
      )}
    </div>
  )
}