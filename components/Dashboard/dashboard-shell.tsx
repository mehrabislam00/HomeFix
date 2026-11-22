import type { DashboardVariant } from "@/lib/dashboard-config"
import { SidebarContent, type DashboardUser } from "./sidebar"
import { Topbar } from "./topbar"

/** Glass sidebar + floating glass top bar + content area. No site Navbar / Footer. */
export function DashboardShell({
  user,
  variant = "customer",
  children,
}: {
  user: DashboardUser
  variant?: DashboardVariant
  children: React.ReactNode
}) {
  return (
    <div className="relative isolate min-h-screen overflow-x-clip bg-ivory lg:grid lg:grid-cols-[272px_minmax(0,1fr)]">
      {/* Soft sage light-pools behind the glass */}
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 -z-10 overflow-hidden"
      >
        <div className="absolute -top-24 right-0 size-[520px] rounded-full bg-sage/25 blur-3xl" />
        <div className="absolute top-1/3 -left-32 size-[420px] rounded-full bg-muted-sage/20 blur-3xl" />
        <div className="absolute -bottom-32 right-1/4 size-[420px] rounded-full bg-sage/15 blur-3xl" />
      </div>

      <aside className="sticky top-0 hidden h-screen p-3 lg:block">
        <div className="liquid-glass relative h-full rounded-[1.75rem] p-4">
          <SidebarContent user={user} variant={variant} />
        </div>
      </aside>

      <div className="relative min-w-0">
        <Topbar user={user} variant={variant} />
        <main className="mx-auto max-w-[1440px] px-4 py-8 sm:px-6 sm:py-10">
          {children}
        </main>
      </div>
    </div>
  )
}