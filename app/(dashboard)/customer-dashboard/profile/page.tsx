import type { Metadata } from "next"
import { redirect } from "next/navigation"

import { getCustomerProfile, updateCustomerProfile } from "@/lib/Action/users"
import { PageHeader } from "@/components/Dashboard/page-header"
import { ProfileCard } from "@/components/Dashboard/profile-card"
import { ProfileForm } from "@/components/Dashboard/profile-form"

export const metadata: Metadata = { title: "Profile — HomeFix" }

const Profile = async () => {
  const result = await getCustomerProfile()
  if (!result.ok && result.unauthorized) redirect("/login")
  if (!result.ok) {
    return (
      <div className="flex flex-col gap-6">
        <PageHeader
          title="Profile"
          description="Manage your personal information."
        />
        <p
          role="alert"
          className="rounded-2xl border border-status-rejected-fg/20 bg-status-rejected-bg p-5 text-sm font-medium text-status-rejected-fg"
        >
          {result.error}
        </p>
      </div>
    )
  }
  const customer = result.customer

  return (
    <div className="flex flex-col gap-6">
      <PageHeader
        title="Profile"
        description="Manage your personal information."
      />
      <div className="grid items-start gap-6 lg:grid-cols-[minmax(0,340px)_minmax(0,1fr)]">
        <ProfileCard customer={customer} />
        <ProfileForm customer={customer} onSubmit={updateCustomerProfile} />
      </div>
    </div>
  )
}

export default Profile
