import type { Metadata } from "next"
import Link from "next/link"
import { format, parseISO } from "date-fns"

import { PageHeader } from "@/components/Dashboard/page-header"
import { ApiError } from "@/components/Dashboard/api-error"
import { RequestsList } from "@/components/Technician/requests-list"
import { Button } from "@/components/ui/button"
import {
  getTechnicianBooking,
  updateTechnicianBooking,
} from "@/lib/Action/booking-actions"
import { btn } from "@/lib/button-styles"
import { cn } from "@/lib/utils"
import type { JobRequest } from "@/lib/technician-data"
import { formatBDT } from "@/lib/utils"

export const metadata: Metadata = {
  title: "Booking details — HomeFix Technician",
}

function formatJobTime(value?: string) {
  return value ? format(parseISO(value), "PPpp") : "Not recorded"
}

function formatRequestedDate(value: string) {
  return value ? format(parseISO(value), "PPP") : "Not provided"
}

export default async function TechnicianBookingDetails({
  params,
}: {
  params: Promise<{ bookingId: string }>
}) {
  const { bookingId } = await params
  let booking: JobRequest
  try {
    booking = await getTechnicianBooking(bookingId)
  } catch (error) {
    console.error("Unable to load technician booking details.", error)
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
        description="Review customer information and update the booking status."
        action={
          <Button className={cn(btn.md, btn.outline)} asChild>
            <Link href="/technician-dashboard/requests">Back to requests</Link>
          </Button>
        }
      />
      <RequestsList
        key={`${booking.id}:${booking.status}`}
        jobs={[booking]}
        onAction={updateTechnicianBooking}
        showDetails={false}
        initialTab={
          booking.status === "requested"
            ? "new"
            : booking.status === "rejected" || booking.status === "cancelled"
              ? "closed"
              : booking.status
        }
      />
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
        </section>

        <section className="glass-card relative rounded-[1.75rem] p-5 sm:p-7">
          <h2 className="font-[family-name:var(--font-manrope)] text-lg font-bold text-forest">
            Customer request
          </h2>
          <dl className="mt-4 grid gap-4 text-sm sm:grid-cols-2">
            <div>
              <dt className="font-semibold text-forest">Customer</dt>
              <dd className="mt-1 text-ink-soft">{booking.customerName}</dd>
            </div>
            <div>
              <dt className="font-semibold text-forest">Email</dt>
              <dd className="mt-1 text-ink-soft">
                {booking.customerEmail || "Not provided"}
              </dd>
            </div>
            <div>
              <dt className="font-semibold text-forest">Phone number</dt>
              <dd className="mt-1 text-ink-soft">
                {booking.customerPhone || "Not provided"}
              </dd>
            </div>
            <div>
              <dt className="font-semibold text-forest">Customer area</dt>
              <dd className="mt-1 text-ink-soft">
                {booking.customerArea || booking.area || "Not provided"}
              </dd>
            </div>
            <div>
              <dt className="font-semibold text-forest">Service address</dt>
              <dd className="mt-1 text-ink-soft">
                {booking.address || "Not provided"}
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
