"use client"

import { useState } from "react"
import Link from "next/link"
import { CalendarCheck } from "lucide-react"


import { BlurFade } from "@/components/magic/blur-fade"
import { Button } from "@/components/ui/button"
import {
  ACTIVE_STATUSES,
  type Booking,
  type BookingStatus,
} from "@/lib/dashboard-data"
import { btn } from "@/lib/button-styles"
import { cn } from "@/lib/utils"
import { BookingRow } from "./booking-row"
import { EmptyState } from "./empty-state"

const filters: {
  key: string
  label: string
  match: (s: BookingStatus) => boolean
}[] = [
  { key: "all", label: "All", match: () => true },
  { key: "active", label: "Active", match: (s) => ACTIVE_STATUSES.includes(s) },
  { key: "completed", label: "Completed", match: (s) => s === "completed" },
  {
    key: "closed",
    label: "Rejected / Cancelled",
    match: (s) => s === "rejected" || s === "cancelled",
  },
]

export function BookingsList({ bookings }: { bookings: Booking[] }) {
  const [filter, setFilter] = useState("all")
  const current = filters.find((f) => f.key === filter) ?? filters[0]
  const visible = bookings.filter((b) => current.match(b.status))

  return (
    <div>
      {/* Segmented filter */}
      <div
        role="group"
        aria-label="Filter bookings"
        className="-mx-4 flex [scrollbar-width:none] gap-1 overflow-x-auto px-4 pb-1 sm:mx-0 sm:w-fit sm:overflow-visible sm:px-0 [&::-webkit-scrollbar]:hidden"
      >
        <div className="flex gap-1 rounded-full border border-white/70 bg-pale-sage p-1 shadow-[inset_0_1px_0_rgb(255_255_255/0.8)]">
          {filters.map(({ key, label }) => {
            const active = key === filter
            return (
              <button
                key={key}
                type="button"
                aria-pressed={active}
                onClick={() => setFilter(key)}
                className={cn(
                  "h-10 shrink-0 rounded-full px-4 text-sm font-medium whitespace-nowrap transition-all duration-200 focus-visible:outline-2 focus-visible:outline-sage motion-reduce:transition-none",
                  active
                    ? "bg-forest text-white shadow-[inset_0_1px_0_rgb(255_255_255/0.2),0_6px_14px_-6px_rgb(38_58_50/0.6)]"
                    : "text-ink-soft hover:bg-forest/10 hover:text-forest"
                )}
              >
                {label}
              </button>
            )
          })}
        </div>
      </div>

      <p aria-live="polite" className="sr-only">
        {visible.length} bookings
      </p>

      <div className="mt-5 flex flex-col gap-3">
        {visible.length ? (
          visible.map((b, i) => (
            <BlurFade
              key={b.id}
              fade={false}
              delay={Math.min(i, 5) * 0.05}
              y={12}
            >
              <BookingRow booking={b} />
            </BlurFade>
          ))
        ) : (
          <div className="glass-card relative rounded-[1.75rem] p-4 sm:p-6">
            <EmptyState
              icon={CalendarCheck}
              title="No bookings here"
              description={
                filter === "all"
                  ? "Book a service and track it from request to payment."
                  : "Nothing matches this filter yet."
              }
              action={
                filter === "all" && (
                  <Button className={cn(btn.md, btn.primary)} asChild>
                    <Link href="/services">Explore services</Link>
                  </Button>
                )
              }
            />
          </div>
        )}
      </div>
    </div>
  )
}