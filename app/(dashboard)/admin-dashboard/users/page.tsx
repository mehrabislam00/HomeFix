import type { Metadata } from "next"
import { Ban, ShieldCheck, Users as UsersIcon } from "lucide-react"

import { UsersTable } from "@/components/Admin/users-table"
import { PageHeader } from "@/components/Dashboard/page-header"
import { ApiError } from "@/components/Dashboard/api-error"
import { StatCard } from "@/components/Dashboard/stat-card"
import {
  getAdminCustomers,
  getAdminProfile,
  getAdminTechnicians,
  getAdminUsers,
} from "@/lib/Action/admin-actions"

export const metadata: Metadata = { title: "Manage Users — HomeFix Admin" }

const Users = async () => {
  let profile: Awaited<ReturnType<typeof getAdminProfile>>
  let users: Awaited<ReturnType<typeof getAdminUsers>>
  let customers: Awaited<ReturnType<typeof getAdminCustomers>>
  let technicians: Awaited<ReturnType<typeof getAdminTechnicians>>
  try {
    ;[profile, users, customers, technicians] = await Promise.all([
      getAdminProfile(),
      getAdminUsers(),
      getAdminCustomers(),
      getAdminTechnicians(),
    ])
  } catch (error) {
    return (
      <div className="flex flex-col gap-6">
        <PageHeader
          title="Manage Users"
          description="View every account and manage roles and access."
        />
        <ApiError
          message={
            error instanceof Error ? error.message : "Unable to load users."
          }
        />
      </div>
    )
  }
  const allUsers = [
    ...customers,
    ...technicians,
    ...users.users.filter((user) => user.role === "admin"),
  ]
  const live = users.live
  const error = users.error
  const count = (role: string) =>
    allUsers.filter((user) => user.role === role).length
  const suspended = allUsers.filter(
    (user) => user.status === "suspended"
  ).length

  return (
    <div className="flex flex-col gap-6">
      <PageHeader
        title="Manage Users"
        description="View every account and manage roles and access."
      />
      {!live && (
        <ApiError
          title="Unable to load users"
          message={error ?? "The user list could not be loaded."}
        />
      )}

      <div className="grid gap-4 md:grid-cols-3">
        <StatCard
          label="Customers"
          value={count("customer")}
          icon={UsersIcon}
          delay={0.05}
        />
        <StatCard
          label="Technicians"
          value={count("technician")}
          icon={ShieldCheck}
          tone="blue"
          delay={0.1}
        />
        <StatCard
          label="Suspended"
          value={suspended}
          icon={Ban}
          tone="amber"
          delay={0.15}
        />
      </div>

      {live && (
        <UsersTable
          users={allUsers}
          currentUserEmail={profile.ok ? profile.customer.email : ""}
        />
      )}
    </div>
  )
}

export default Users
