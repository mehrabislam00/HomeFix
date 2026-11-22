import Link from "next/link"
import { ArrowRight, CalendarCheck } from "lucide-react"

import { BlurFade } from "@/components/magic/blur-fade"
import type { Booking } from "@/lib/dashboard-data"
import { BookingRow } from "./booking-row"
import { EmptyState } from "./empty-state"

export function RecentBookings({ bookings }: { bookings: Booking[] }) {
  return (
    <BlurFade fade={false} delay={0.1} y={16} className="h-full">
      <section className="glass-card relative h-full rounded-[1.75rem] p-5 sm:p-7">
        <div className="flex items-center justify-between gap-4">
          <div>
            <h2 className="font-[family-name:var(--font-manrope)] text-xl font-extrabold tracking-tight text-forest">
              Recent bookings
            </h2>
            <p className="mt-1 text-sm text-ink-soft">
              Your latest service requests.
            </p>
          </div>
          <Link
            href="/dashboard/bookings"
            className="group inline-flex items-center gap-1.5 rounded-lg text-sm font-semibold text-sage-deep transition-colors hover:text-forest focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-sage"
          >
            View all
            <ArrowRight
              aria-hidden
              className="size-4 transition-transform duration-200 group-hover:translate-x-0.5 motion-reduce:transition-none"
            />
          </Link>
        </div>

        <div className="mt-5 flex flex-col gap-1.5">
          {bookings.length ? (
            bookings
              .slice(0, 4)
              .map((b) => <BookingRow key={b.id} booking={b} compact />)
          ) : (
            <EmptyState
              icon={CalendarCheck}
              title="No bookings yet"
              description="When you book a service it will show up here."
            />
          )}
        </div>
      </section>
    </BlurFade>
  )
}