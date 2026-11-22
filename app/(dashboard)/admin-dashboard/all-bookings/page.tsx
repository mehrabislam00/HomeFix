import type { Metadata } from "next"

import { AdminBookingsTable } from "@/components/Admin/admin-bookings-table"
import { PageHeader } from "@/components/Dashboard/page-header"
import { SampleDataNotice } from "@/components/Dashboard/sample-data-notice"
import { getAdminBookings } from "@/lib/admin-data"

export const metadata: Metadata = { title: "All Bookings — HomeFix Admin" }

const AllBookings = async () => {
  const bookings = await getAdminBookings()
  const sorted = [...bookings].sort((a, b) => a.id.localeCompare(b.id, undefined, { numeric: true }))

  return (
    <div className="flex flex-col gap-6">
      <PageHeader
        title="All Bookings"
        description={`${bookings.length} ${bookings.length === 1 ? "booking" : "bookings"} across the platform.`}
      />
      <SampleDataNotice />
      <AdminBookingsTable bookings={sorted} />
    </div>
  )
}

export default AllBookings