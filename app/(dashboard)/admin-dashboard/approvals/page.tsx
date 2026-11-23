import type { Metadata } from "next"

import { ApprovalsList } from "@/components/Admin/approvals-list"
import { ApiError } from "@/components/Dashboard/api-error"
import { PageHeader } from "@/components/Dashboard/page-header"
import {
  decideAdminService,
  deleteAdminService,
  getAdminServices,
  updateAdminService,
} from "@/lib/Action/admin-actions"

export const metadata: Metadata = { title: "Service Approval — HomeFix Admin" }

const Approvals = async () => {
  let services: Awaited<ReturnType<typeof getAdminServices>>
  try {
    services = await getAdminServices()
  } catch (error) {
    return (
      <div className="flex flex-col gap-6">
        <PageHeader
          title="Service Approval"
          description="Review technician submissions before they're visible to customers."
        />
        <ApiError
          message={
            error instanceof Error ? error.message : "Unable to load services."
          }
        />
      </div>
    )
  }
  return (
    <div className="flex flex-col gap-6">
      <PageHeader
        title="Service Approval"
        description="Review technician submissions before they're visible to customers."
      />
      <ApprovalsList
        services={services}
        onDecision={decideAdminService}
        onDelete={deleteAdminService}
        onUpdate={updateAdminService}
      />
    </div>
  )
}

export default Approvals
