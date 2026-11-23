import { redirect } from "next/navigation"

import { DashboardShell } from "@/components/Dashboard/dashboard-shell"
import type { DashboardVariant } from "@/lib/dashboard-config"
import { getAdminProfile } from "@/lib/Action/admin-actions"
import { getCustomerProfile } from "@/lib/Action/customer-actions"
import { getTechnicianProfile } from "@/lib/Action/technician-actions"
import { ApiError } from "./api-error"

const loaders = {
  customer: getCustomerProfile,
  technician: getTechnicianProfile,
  admin: getAdminProfile,
} as const

const roleLabel = {
  customer: "Customer",
  technician: "Technician",
  admin: "Admin",
} as const

/**
 * Shared server layout for both dashboards: verifies the session role, then
 * renders the same DashboardShell with the role's navigation.
 */
export async function RoleDashboardLayout({
  variant,
  children,
}: {
  variant: DashboardVariant
  children: React.ReactNode
}) {
  const result = await loaders[variant]()
  if (!result.ok && result.unauthorized) {
    redirect(result.redirectTo ?? "/login")
  }

  const role = roleLabel[variant]
  const user = result.ok
    ? {
        name: result.customer.name,
        role,
        image: result.customer.image,
        email: result.customer.email,
      }
    : { name: role, role }

  return (
    <DashboardShell user={user} variant={variant}>
      {result.ok ? (
        children
      ) : (
        <ApiError title="Unable to verify your session" message={result.error} />
      )}
    </DashboardShell>
  )
}
