import type { Metadata } from "next"
import Link from "next/link"

import { BookingRow } from "@/components/Dashboard/booking-row"
import { ApiError } from "@/components/Dashboard/api-error"
import { PageHeader } from "@/components/Dashboard/page-header"
import { Button } from "@/components/ui/button"
import { getCustomerBooking } from "@/lib/Action/booking-actions"
import { btn } from "@/lib/button-styles"
import { cn } from "@/lib/utils"
import type { Booking } from "@/lib/dashboard-data"

export const metadata: Metadata = { title: "Booking details — HomeFix" }

export default async function CustomerBookingDetails({
  params,
}: {
  params: Promise<{ bookingId: string }>
}) {
  const { bookingId } = await params
  let booking: Booking
  try {
    booking = await getCustomerBooking(bookingId)
  } catch (error) {
    console.error("Unable to load customer booking details.", error)
    return (
      <ApiError
        message={
          error instanceof Error
            ? error.message
            : "Please try again in a moment."
        }
      />
    )
  }

  return (
    <div className="flex flex-col gap-6">
      <PageHeader
        title="Booking details"
        description="Review your service request and its latest status."
        action={
          <Button className={cn(btn.md, btn.outline)} asChild>
            <Link href="/customer-dashboard/bookings">Back to bookings</Link>
          </Button>
        }
      />
      <BookingRow booking={booking} showDetails={false} />
      <section className="glass-card relative rounded-[1.75rem] p-5 sm:p-7">
        <h2 className="font-[family-name:var(--font-manrope)] text-lg font-bold text-forest">
          Request information
        </h2>
        <dl className="mt-4 grid gap-4 text-sm sm:grid-cols-2">
          <div>
            <dt className="font-semibold text-forest">Service address</dt>
            <dd className="mt-1 text-ink-soft">
              {booking.address || "Not provided"}
            </dd>
          </div>
          <div>
            <dt className="font-semibold text-forest">Phone number</dt>
            <dd className="mt-1 text-ink-soft">
              {booking.phone || "Not provided"}
            </dd>
          </div>
          {booking.notes && (
            <div className="sm:col-span-2">
              <dt className="font-semibold text-forest">Notes</dt>
              <dd className="mt-1 whitespace-pre-wrap text-ink-soft">
                {booking.notes}
              </dd>
            </div>
          )}
        </dl>
        {booking.serviceId && (
          <Button className={cn(btn.md, btn.outline, "mt-5")} asChild>
            <Link href={`/services/${encodeURIComponent(booking.serviceId)}`}>
              View service
            </Link>
          </Button>
        )}
      </section>
    </div>
  )
}
