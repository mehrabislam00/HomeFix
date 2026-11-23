import { RoleDashboardLayout } from "@/components/Dashboard/role-dashboard-layout"


export const dynamic = "force-dynamic"

/** Customer dashboard chrome. No site Navbar / Footer. */
export default function CustomerDashboardLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return <RoleDashboardLayout variant="customer">{children}</RoleDashboardLayout>
}
