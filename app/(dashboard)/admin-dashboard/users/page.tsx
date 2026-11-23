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
  const [profileResult, usersResult, customersResult, techniciansResult] =
    await Promise.allSettled([
      getAdminProfile(),
      getAdminUsers(),
      getAdminCustomers(),
      getAdminTechnicians(),
    ])
  const profile =
    profileResult.status === "fulfilled" ? profileResult.value : null
  const users = usersResult.status === "fulfilled" ? usersResult.value : null
  const customers =
    customersResult.status === "fulfilled" ? customersResult.value : []
  const technicians =
    techniciansResult.status === "fulfilled" ? techniciansResult.value : []
  const allUsers = [
    ...customers,
    ...technicians,
    ...(users?.users.filter((user) => user.role === "admin") ?? []),
  ]
  const live = Boolean(
    users?.live &&
    customersResult.status === "fulfilled" &&
    techniciansResult.status === "fulfilled"
  )
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
      {usersResult.status === "rejected" && (
        <ApiError
          title="Unable to load users"
          message={
            usersResult.reason instanceof Error
              ? usersResult.reason.message
              : "The user list could not be loaded."
          }
        />
      )}
      {users && !users.live && (
        <ApiError
          title="Unable to load users"
          message={users.error ?? "The user list could not be loaded."}
        />
      )}
      {customersResult.status === "rejected" && (
        <ApiError
          title="Unable to load customers"
          message={
            customersResult.reason instanceof Error
              ? customersResult.reason.message
              : "The customer list could not be loaded."
          }
        />
      )}
      {techniciansResult.status === "rejected" && (
        <ApiError
          title="Unable to load technicians"
          message={
            techniciansResult.reason instanceof Error
              ? techniciansResult.reason.message
              : "The technician list could not be loaded."
          }
        />
      )}

      {live && (
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
      )}

      {live && (
        <UsersTable
          users={allUsers}
          currentUserEmail={profile?.ok ? profile.customer.email : ""}
        />
      )}
    </div>
  )
}

export default Users
