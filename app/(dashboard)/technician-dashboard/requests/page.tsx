import type { Metadata } from "next"

import { PageHeader } from "@/components/Dashboard/page-header"
import { SampleDataNotice } from "@/components/Dashboard/sample-data-notice"
import { RequestsList } from "@/components/Technician/requests-list"
import { getJobRequests } from "@/lib/technician-data"

export const metadata: Metadata = {
  title: "Manage Requests — HomeFix Technician",
}

const Requests = async () => {
  const jobs = await getJobRequests()
  return (
    <div className="flex flex-col gap-6">
      <PageHeader
        title="Manage Requests"
        description="Accept new jobs, start work and complete them with the final amount."
      />
      <SampleDataNotice />
      {/* Pass `onAction` (server action returning { ok }) to enable job buttons. */}
      <RequestsList jobs={jobs} />
    </div>
  )
}

export default Requests