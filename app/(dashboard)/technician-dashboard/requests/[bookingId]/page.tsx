import type { Metadata } from "next"
import Link from "next/link"

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

export const metadata: Metadata = {
  title: "Booking details — HomeFix Technician",
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
          booking.status === "rejected" || booking.status === "cancelled"
            ? "closed"
            : booking.status
        }
      />
    </div>
  )
}
