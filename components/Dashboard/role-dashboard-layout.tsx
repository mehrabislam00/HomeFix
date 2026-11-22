import { redirect } from "next/navigation"

import { DashboardShell } from "@/components/Dashboard/dashboard-shell"
import type { DashboardVariant } from "@/lib/dashboard-config"
import { getCustomerProfile } from "@/lib/Action/customer-actions"
import { getTechnicianProfile } from "@/lib/Action/technician-actions"

const loaders = {
  customer: getCustomerProfile,
  technician: getTechnicianProfile,
} as const

const roleLabel = { customer: "Customer", technician: "Technician" } as const

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
        <p
          role="alert"
          className="rounded-2xl border border-status-rejected-fg/20 bg-status-rejected-bg p-5 text-sm font-medium text-status-rejected-fg"
        >
          {result.error}
        </p>
      )}
    </DashboardShell>
  )
}