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
import type { CancelBookingResult } from "@/lib/Action/booking-actions"
import { BookingRow } from "./booking-row"
import { EmptyState } from "./empty-state"
import { SegmentedFilter } from "./segmented-filter"

const filters: {
  key: string
  label: string
  match: (s: BookingStatus) => boolean
}[] = [
  { key: "all", label: "All", match: () => true },
  { key: "active", label: "Active", match: (s) => ACTIVE_STATUSES.includes(s) },
  { key: "completed", label: "Completed", match: (s) => s === "completed" },
  { key: "rejected", label: "Rejected", match: (s) => s === "rejected" },
  { key: "cancelled", label: "Cancelled", match: (s) => s === "cancelled" },
]

export function BookingsList({
  bookings,
  onCancelRequest,
}: {
  bookings: Booking[]
  onCancelRequest: (bookingId: string) => Promise<CancelBookingResult>
}) {
  const [filter, setFilter] = useState("all")
  const [statusOverrides, setStatusOverrides] = useState<
    Partial<Record<string, BookingStatus>>
  >({})
  const current = filters.find((f) => f.key === filter) ?? filters[0]
  const currentBookings = bookings.map((booking) => ({
    ...booking,
    status: statusOverrides[booking.id] ?? booking.status,
  }))
  const visible = currentBookings.filter((b) => current.match(b.status))

  return (
    <div>
      <SegmentedFilter
        label="Filter bookings"
        items={filters}
        value={filter}
        onChange={setFilter}
      />

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
              <BookingRow
                booking={b}
                showPayNow
                onCancelRequest={onCancelRequest}
                onCancelled={(bookingId) =>
                  setStatusOverrides((currentOverrides) => ({
                    ...currentOverrides,
                    [bookingId]: "cancelled",
                  }))
                }
              />
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
