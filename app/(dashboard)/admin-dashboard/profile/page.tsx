import type { Metadata } from "next"
import { redirect } from "next/navigation"

import { PageHeader } from "@/components/Dashboard/page-header"
import { ProfileCard } from "@/components/Dashboard/profile-card"
import { ProfileForm } from "@/components/Dashboard/profile-form"
import { getAdminProfile, updateAdminProfile } from "@/lib/Action/admin-actions"

export const metadata: Metadata = { title: "Profile — HomeFix Admin" }

const Profile = async () => {
  const result = await getAdminProfile()
  if (!result.ok && result.unauthorized) {
    redirect(result.redirectTo ?? "/admin/login")
  }

  const header = (
    <PageHeader title="Profile" description="Manage your personal information." />
  )

  if (!result.ok) {
    return (
      <div className="flex flex-col gap-6">
        {header}
        <p
          role="alert"
          className="rounded-2xl border border-status-rejected-fg/20 bg-status-rejected-bg p-5 text-sm font-medium text-status-rejected-fg"
        >
          {result.error}
        </p>
      </div>
    )
  }

  return (
    <div className="flex flex-col gap-6">
      {header}
      <div className="grid items-start gap-6 lg:grid-cols-[minmax(0,340px)_minmax(0,1fr)]">
        <ProfileCard customer={result.customer} />
        <ProfileForm
          customer={result.customer}
          onSubmit={updateAdminProfile}
          allowPhoto={false}
        />
      </div>
    </div>
  )
}

export default Profile