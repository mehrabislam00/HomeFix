import type { Metadata } from "next"

import { ApprovalsList } from "@/components/Admin/approvals-list"
import { PageHeader } from "@/components/Dashboard/page-header"
import { SampleDataNotice } from "@/components/Dashboard/sample-data-notice"
import { getAdminServices } from "@/lib/admin-data"

export const metadata: Metadata = { title: "Service Approval — HomeFix Admin" }

const Approvals = async () => {
  const services = await getAdminServices()
  return (
    <div className="flex flex-col gap-6">
      <PageHeader
        title="Service Approval"
        description="Review technician submissions before they're visible to customers."
      />
      <SampleDataNotice />
      {/* Pass `onDecision` (a server action that approves / rejects) to persist decisions. */}
      <ApprovalsList services={services} />
    </div>
  )
}

export default Approvals