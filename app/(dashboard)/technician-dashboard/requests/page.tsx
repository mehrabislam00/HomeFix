import type { Metadata } from "next"

import { PageHeader } from "@/components/Dashboard/page-header"
import { ApiError } from "@/components/Dashboard/api-error"
import {
  getTechnicianBookings,
  updateTechnicianBooking,
} from "@/lib/Action/booking-actions"
import { RequestsList } from "@/components/Technician/requests-list"
import type { JobRequest } from "@/lib/technician-data"

export const metadata: Metadata = {
  title: "Manage Requests — HomeFix Technician",
}

const Requests = async () => {
  let jobs: JobRequest[]
  try {
    jobs = await getTechnicianBookings()
  } catch (error) {
    console.error("Unable to load technician booking requests.", error)
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
        title="Manage Requests"
        description="Accept new jobs, start work and complete them with the final amount."
      />
      <RequestsList jobs={jobs} onAction={updateTechnicianBooking} />
    </div>
  )
}

export default Requests
