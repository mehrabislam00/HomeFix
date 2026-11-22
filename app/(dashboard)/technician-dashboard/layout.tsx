import { RoleDashboardLayout } from "@/components/Dashboard/role-dashboard-layout"

export const dynamic = "force-dynamic"

/** Technician dashboard chrome — same shell as the customer dashboard. */
export default function TechnicianDashboardLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <RoleDashboardLayout variant="technician">{children}</RoleDashboardLayout>
  )
}