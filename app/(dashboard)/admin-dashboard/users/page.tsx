import type { Metadata } from "next"
import { Ban, ShieldCheck, Users as UsersIcon } from "lucide-react"

import { UsersTable } from "@/components/Admin/users-table"
import { PageHeader } from "@/components/Dashboard/page-header"
import { SampleDataNotice } from "@/components/Dashboard/sample-data-notice"
import { StatCard } from "@/components/Dashboard/stat-card"
import { getAdminProfile, getAdminUsers } from "@/lib/Action/admin-actions"

export const metadata: Metadata = { title: "Manage Users — HomeFix Admin" }

const Users = async () => {
  const [profile, { users, live }] = await Promise.all([
    getAdminProfile(),
    getAdminUsers(),
  ])
  const count = (role: string) => users.filter((u) => u.role === role).length
  const suspended = users.filter((u) => u.status === "suspended").length

  return (
    <div className="flex flex-col gap-6">
      <PageHeader
        title="Manage Users"
        description="View every account and manage roles and access."
      />
      {!live && (
        <SampleDataNotice>
          The user database couldn&apos;t be reached, so sample accounts are
          shown.
        </SampleDataNotice>
      )}

      <div className="grid gap-4 md:grid-cols-3">
        <StatCard label="Customers" value={count("customer")} icon={UsersIcon} delay={0.05} />
        <StatCard label="Technicians" value={count("technician")} icon={ShieldCheck} tone="blue" delay={0.1} />
        <StatCard label="Suspended" value={suspended} icon={Ban} tone="amber" delay={0.15} />
      </div>

      <UsersTable
        users={users}
        currentUserEmail={profile.ok ? profile.customer.email : ""}
      />
    </div>
  )
}

export default Users