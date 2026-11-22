import { SidebarContent } from "./sidebar";
import { Topbar } from "./topbar";


/** Sidebar + sticky top bar + content area. No site Navbar / Footer. */
export function DashboardShell({
  user,
  children,
}: {
  user: { name: string; role: string }
  children: React.ReactNode
}) {
  return (
    <div className="relative isolate min-h-screen bg-ivory lg:grid lg:grid-cols-[256px_minmax(0,1fr)]">
      <aside className="sticky top-0 hidden h-screen border-r border-line bg-surface/70 p-3 backdrop-blur-xl lg:block">
        <SidebarContent user={user} />
      </aside>

      <div className="relative min-w-0">
        {/* Soft sage light-pools, same as the rest of the site */}
        <div
          aria-hidden
          className="pointer-events-none absolute inset-x-0 top-0 -z-10 h-[700px] overflow-hidden"
        >
          <div className="absolute -top-16 -right-24 size-[460px] rounded-full bg-sage/20 blur-3xl" />
          <div className="absolute top-40 -left-24 size-[360px] rounded-full bg-muted-sage/15 blur-3xl" />
        </div>
        <Topbar user={user} />
        <main className="mx-auto max-w-[1440px] px-4 py-8 sm:px-6 sm:py-10">
          {children}
        </main>
      </div>
    </div>
  )
}