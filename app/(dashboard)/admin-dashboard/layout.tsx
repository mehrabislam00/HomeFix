import { RoleDashboardLayout } from "@/components/Dashboard/role-dashboard-layout"

export const dynamic = "force-dynamic"

/** Admin dashboard chrome — same shell as the customer and technician dashboards. */
export default function AdminDashboardLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return <RoleDashboardLayout variant="admin">{children}</RoleDashboardLayout>
}