import type { Metadata } from "next"
import Link from "next/link"
import { format, parseISO } from "date-fns"

import { BookingRow } from "@/components/Dashboard/booking-row"
import { ApiError } from "@/components/Dashboard/api-error"
import { PageHeader } from "@/components/Dashboard/page-header"
import { Button } from "@/components/ui/button"
import { getCustomerBooking } from "@/lib/Action/booking-actions"
import { btn } from "@/lib/button-styles"
import { cn, formatBDT } from "@/lib/utils"
import type { Booking } from "@/lib/dashboard-data"

export const metadata: Metadata = { title: "Booking details — HomeFix" }

function formatJobTime(value?: string) {
  return value ? format(parseISO(value), "PPpp") : "Not recorded"
}

function formatRequestedDate(value: string) {
  return value ? format(parseISO(value), "PPP") : "Not provided"
}

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
      <div className="grid gap-6 lg:grid-cols-2">
        <section className="glass-card relative rounded-[1.75rem] p-5 sm:p-7">
          <h2 className="font-[family-name:var(--font-manrope)] text-lg font-bold text-forest">
            Booked service
          </h2>
          <dl className="mt-4 grid gap-4 text-sm sm:grid-cols-2">
            <div>
              <dt className="font-semibold text-forest">Service</dt>
              <dd className="mt-1 text-ink-soft">{booking.serviceTitle}</dd>
            </div>
            <div>
              <dt className="font-semibold text-forest">Category</dt>
              <dd className="mt-1 text-ink-soft">
                {booking.serviceCategory || "Not provided"}
              </dd>
            </div>
            <div className="sm:col-span-2">
              <dt className="font-semibold text-forest">Description</dt>
              <dd className="mt-1 whitespace-pre-wrap text-ink-soft">
                {booking.serviceDescription || "Not available for this booking"}
              </dd>
            </div>
            <div>
              <dt className="font-semibold text-forest">Technician</dt>
              <dd className="mt-1 text-ink-soft">{booking.technician}</dd>
            </div>
            <div>
              <dt className="font-semibold text-forest">Technician contact</dt>
              <dd className="mt-1 text-ink-soft">
                {booking.technicianPhone ||
                  booking.technicianEmail ||
                  "Not provided"}
              </dd>
            </div>
            <div>
              <dt className="font-semibold text-forest">Booked price</dt>
              <dd className="mt-1 text-ink-soft">
                {formatBDT(booking.estimate)}
              </dd>
            </div>
            {booking.finalAmount !== undefined && (
              <div>
                <dt className="font-semibold text-forest">Final amount</dt>
                <dd className="mt-1 text-ink-soft">
                  {formatBDT(booking.finalAmount)}
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
            <div>
              <dt className="font-semibold text-forest">Requested date</dt>
              <dd className="mt-1 text-ink-soft">
                {formatRequestedDate(booking.date)}
              </dd>
            </div>
            <div>
              <dt className="font-semibold text-forest">Job started</dt>
              <dd className="mt-1 text-ink-soft">
                {formatJobTime(booking.jobStartedAt)}
              </dd>
            </div>
            <div>
              <dt className="font-semibold text-forest">Job completed</dt>
              <dd className="mt-1 text-ink-soft">
                {formatJobTime(booking.jobCompletedAt)}
              </dd>
            </div>
            <div className="sm:col-span-2">
              <dt className="font-semibold text-forest">Problem description</dt>
              <dd className="mt-1 whitespace-pre-wrap text-ink-soft">
                {booking.notes || "No additional details provided"}
              </dd>
            </div>
          </dl>
        </section>
      </div>
    </div>
  )
}
