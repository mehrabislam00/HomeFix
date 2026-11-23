import type { Metadata } from "next"
import Link from "next/link"

import { Button } from "@/components/ui/button"
import { btn } from "@/lib/button-styles"
import { getCustomerBookings } from "@/lib/Action/booking-actions"
import { cn } from "@/lib/utils"
import { PageHeader } from "@/components/Dashboard/page-header"
import { BookingsList } from "@/components/Dashboard/bookings-list"
import { ApiError } from "@/components/Dashboard/api-error"
import type { Booking } from "@/lib/dashboard-data"

export const metadata: Metadata = { title: "My Services — HomeFix" }

const Bookings = async () => {
  let bookings: Booking[]
  try {
    bookings = await getCustomerBookings()
  } catch (error) {
    console.error("Unable to load customer bookings.", error)
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
  const sorted = [...bookings].sort((a, b) => b.date.localeCompare(a.date))

  return (
    <div className="flex flex-col gap-6">
      <PageHeader
        title="My Services"
        description="Track your booked services, booking details and current status."
        action={
          <Button
            className={cn(
              btn.lg,
              btn.primary,
              "shine relative overflow-hidden"
            )}
            asChild
          >
            <Link href="/services">Book a service</Link>
          </Button>
        }
      />
      <BookingsList bookings={sorted} />
    </div>
  )
}

export default Bookings
