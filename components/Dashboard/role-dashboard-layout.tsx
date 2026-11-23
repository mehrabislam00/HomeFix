import { redirect } from "next/navigation"

import { DashboardShell } from "@/components/Dashboard/dashboard-shell"
import type { DashboardVariant } from "@/lib/dashboard-config"
import { getProfileSession } from "@/lib/Action/profile-action-utils"
import { getAdminSession } from "@/lib/Action/admin-actions"
import { ApiError } from "./api-error"

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
  const role = roleLabel[variant]
  if (variant === "customer" || variant === "technician") {
    const access = await getProfileSession(variant)
    if (!access.ok) {
      if (access.unauthorized) redirect(access.redirectTo ?? "/login")
      return (
        <DashboardShell user={{ name: role, role }} variant={variant}>
          {children}
        </DashboardShell>
      )
    }
    return (
      <DashboardShell
        user={{
          name: access.session.user.name,
          role,
          image: access.session.user.image ?? undefined,
          email: access.session.user.email,
        }}
        variant={variant}
      >
        {children}
      </DashboardShell>
    )
  }

  const access = await getAdminSession()
  if (!access.ok) {
    if (access.unauthorized) redirect(access.redirectTo ?? "/admin/login")
    return (
      <DashboardShell user={{ name: role, role }} variant={variant}>
        <ApiError
          title="Unable to verify your session"
          message={access.error}
        />
      </DashboardShell>
    )
  }

  return (
    <DashboardShell
      user={{
        name: access.session.user.name,
        role,
        image: access.session.user.image ?? undefined,
        email: access.session.user.email,
      }}
      variant={variant}
    >
      {children}
    </DashboardShell>
  )
}
