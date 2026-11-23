import type { Metadata } from "next"

import { AdminBookingsTable } from "@/components/Admin/admin-bookings-table"
import { ApiError } from "@/components/Dashboard/api-error"
import { PageHeader } from "@/components/Dashboard/page-header"
import {
  getAdminBookings,
  updateAdminBooking,
} from "@/lib/Action/admin-actions"

export const metadata: Metadata = { title: "All Bookings — HomeFix Admin" }

const AllBookings = async () => {
  let bookings: Awaited<ReturnType<typeof getAdminBookings>>
  try {
    bookings = await getAdminBookings()
  } catch (error) {
    return (
      <div className="flex flex-col gap-6">
        <PageHeader title="All Bookings" description="Platform bookings." />
        <ApiError
          message={
            error instanceof Error ? error.message : "Unable to load bookings."
          }
        />
      </div>
    )
  }
  const sorted = [...bookings].sort((a, b) =>
    a.id.localeCompare(b.id, undefined, { numeric: true })
  )

  return (
    <div className="flex flex-col gap-6">
      <PageHeader
        title="All Bookings"
        description={`${bookings.length} ${bookings.length === 1 ? "booking" : "bookings"} across the platform.`}
      />
      <AdminBookingsTable bookings={sorted} onUpdate={updateAdminBooking} />
    </div>
  )
}

export default AllBookings
