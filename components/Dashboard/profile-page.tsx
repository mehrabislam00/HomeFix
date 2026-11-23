import { redirect } from "next/navigation"

import { PageHeader } from "@/components/Dashboard/page-header"
import { ApiError } from "@/components/Dashboard/api-error"
import { ProfileCard } from "@/components/Dashboard/profile-card"
import { ProfileForm } from "@/components/Dashboard/profile-form"
import {
  getCustomerProfile,
  updateCustomerProfile,
} from "@/lib/Action/customer-actions"
import {
  getTechnicianProfile,
  updateTechnicianProfile,
} from "@/lib/Action/technician-actions"

const roles = {
  customer: { load: getCustomerProfile, save: updateCustomerProfile },
  technician: { load: getTechnicianProfile, save: updateTechnicianProfile },
} as const

/** The one profile screen used by both dashboards. */
export async function ProfilePage({
  role,
}: {
  role: "customer" | "technician"
}) {
  const { load, save } = roles[role]
  const result = await load()
  if (!result.ok && result.unauthorized) {
    redirect(result.redirectTo ?? "/login")
  }

  const header = (
    <PageHeader
      title="Profile"
      description="Manage your personal information."
    />
  )

  if (!result.ok) {
    return (
      <div className="flex flex-col gap-6">
        {header}
        <ApiError title="Unable to load your profile" message={result.error} />
      </div>
    )
  }

  return (
    <div className="flex flex-col gap-6">
      {header}
      <div className="grid items-start gap-6 lg:grid-cols-[minmax(0,340px)_minmax(0,1fr)]">
        <ProfileCard customer={result.customer} />
        <ProfileForm customer={result.customer} onSubmit={save} />
      </div>
    </div>
  )
}