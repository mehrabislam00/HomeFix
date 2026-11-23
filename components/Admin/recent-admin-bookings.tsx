import { format, parseISO } from "date-fns"
import { CalendarCheck } from "lucide-react"

import { EmptyState } from "@/components/Dashboard/empty-state"
import { BookingStatusBadge } from "@/components/Dashboard/status-badge"
import type { AdminBooking } from "@/lib/admin-data"
import { OverviewPanel } from "./overview-panel"

export function RecentAdminBookings({
  bookings,
}: {
  bookings: AdminBooking[]
}) {
  const recent = [...bookings]
    .sort((a, b) => b.date.localeCompare(a.date))
    .slice(0, 5)

  return (
    <OverviewPanel
      title="Recent bookings"
      description="Latest requests across the platform."
      href="/admin-dashboard/all-bookings"
      linkLabel="View all"
      delay={0.22}
    >
      {recent.length ? (
        <ul className="flex flex-col gap-1.5">
          {recent.map((booking) => (
            <li
              key={booking.id}
              className="flex items-center gap-3 rounded-3xl border border-transparent p-2 transition-colors duration-200 hover:border-white/80 hover:bg-white/60"
            >
              <div className="min-w-0 flex-1">
                <p className="truncate font-[family-name:var(--font-manrope)] text-sm font-bold text-forest">
                  {booking.serviceTitle}
                </p>
                <p className="mt-0.5 truncate text-xs text-ink-soft">
                  {booking.customer} ·{" "}
                  {booking.date
                    ? format(parseISO(booking.date), "MMM d, yyyy")
                    : "Date not set"}
                </p>
              </div>
              <BookingStatusBadge
                status={booking.status}
                className="shrink-0"
              />
            </li>
          ))}
        </ul>
      ) : (
        <EmptyState
          icon={CalendarCheck}
          title="No bookings yet"
          description="Customer bookings will show up here."
        />
      )}
    </OverviewPanel>
  )
}
