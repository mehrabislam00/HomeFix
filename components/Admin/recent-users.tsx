import { Users } from "lucide-react"

import { EmptyState } from "@/components/Dashboard/empty-state"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { initialsOf } from "@/lib/dashboard-data"
import type { AdminUser } from "@/lib/admin-data"
import { OverviewPanel } from "./overview-panel"
import { RoleBadge } from "./user-badges"

export function RecentUsers({ users }: { users: AdminUser[] }) {
  const recent = [...users]
    .sort((a, b) => b.joinedAt.localeCompare(a.joinedAt))
    .slice(0, 5)

  return (
    <OverviewPanel
      title="Recent users"
      description="Newest accounts on HomeFix."
      href="/admin-dashboard/users"
      linkLabel="Manage"
      delay={0.18}
    >
      {recent.length ? (
        <ul className="flex flex-col gap-1.5">
          {recent.map((user) => (
            <li
              key={user.id}
              className="flex items-center gap-3 rounded-3xl border border-transparent p-2 transition-colors duration-200 hover:border-white/80 hover:bg-white/60"
            >
              <Avatar size="lg" className="ring-2 ring-white">
                {user.image && <AvatarImage src={user.image} alt={user.name} />}
                <AvatarFallback className="bg-sage text-xs font-semibold text-white">
                  {initialsOf(user.name)}
                </AvatarFallback>
              </Avatar>
              <div className="min-w-0 flex-1">
                <p className="truncate text-sm font-semibold text-forest">{user.name}</p>
                <p className="mt-0.5 truncate text-xs text-ink-soft">{user.email}</p>
              </div>
              <RoleBadge role={user.role} />
            </li>
          ))}
        </ul>
      ) : (
        <EmptyState
          icon={Users}
          title="No users yet"
          description="Accounts will be listed here as people sign up."
        />
      )}
    </OverviewPanel>
  )
}