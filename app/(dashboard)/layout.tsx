import { redirect } from "next/navigation"

import { DashboardShell } from "@/components/Dashboard/dashboard-shell"
import { getCustomerProfile } from "@/lib/Action/users"

export const dynamic = "force-dynamic"

/** Customer dashboard chrome. Lives in its own route group so it has no site Navbar / Footer. */
export default async function DashboardLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  const result = await getCustomerProfile()
  if (!result.ok && result.unauthorized) redirect("/login")

  const user = result.ok
    ? {
        name: result.customer.name,
        role: "Customer",
        image: result.customer.image,
      }
    : { name: "Customer", role: "Customer" }

  return (
    <DashboardShell user={user}>
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
