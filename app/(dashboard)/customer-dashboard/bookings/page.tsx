import type { Metadata } from "next"
import Link from "next/link"


import { Button } from "@/components/ui/button"
import { btn } from "@/lib/button-styles"
import { getBookings } from "@/lib/dashboard-data"
import { cn } from "@/lib/utils"
import { PageHeader } from "@/components/Dashboard/page-header"
import { BookingsList } from "@/components/Dashboard/bookings-list"

export const metadata: Metadata = { title: "My Bookings — HomeFix" }

const Bookings = async () => {
  const bookings = await getBookings()
  const sorted = [...bookings].sort((a, b) => b.date.localeCompare(a.date))

  return (
    <div className="flex flex-col gap-6">
      <PageHeader
        title="My Bookings"
        description="Track every repair from request to payment."
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