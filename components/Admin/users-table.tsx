"use client"

import { useState } from "react"
import { format, parseISO } from "date-fns"
import { Mail, MoreHorizontal, Users } from "lucide-react"

import { EmptyState } from "@/components/Dashboard/empty-state"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Button } from "@/components/ui/button"
import type { AdminUser } from "@/lib/admin-data"
import { btn } from "@/lib/button-styles"
import { initialsOf } from "@/lib/dashboard-data"
import { cn } from "@/lib/utils"
import { DetailRows, DetailSheet } from "./detail-sheet"
import { rowClass, tdClass, thClass, TableCard } from "./table-card"
import { FilterSelect, SearchInput } from "./table-toolbar"
import { RoleBadge, UserStatusBadge } from "./user-badges"

const roleOptions = [
  { value: "all", label: "All roles" },
  { value: "admin", label: "Admins" },
  { value: "technician", label: "Technicians" },
  { value: "customer", label: "Customers" },
]

const formatDate = (iso: string) => (iso ? format(parseISO(iso), "MMM d, yyyy") : "—")

function UserAvatar({ user, className }: { user: AdminUser; className?: string }) {
  return (
    <Avatar size="lg" className={cn("ring-2 ring-white", className)}>
      {user.image && <AvatarImage src={user.image} alt={user.name} />}
      <AvatarFallback className="bg-sage text-xs font-semibold text-white">
        {initialsOf(user.name)}
      </AvatarFallback>
    </Avatar>
  )
}

export function UsersTable({
  users,
  currentUserEmail,
}: {
  users: AdminUser[]
  currentUserEmail: string
}) {
  const [query, setQuery] = useState("")
  const [role, setRole] = useState("all")
  const [selected, setSelected] = useState<AdminUser | null>(null)

  const needle = query.trim().toLowerCase()
  const visible = users.filter(
    (user) =>
      (role === "all" || user.role === role) &&
      (!needle ||
        user.name.toLowerCase().includes(needle) ||
        user.email.toLowerCase().includes(needle))
  )

  return (
    <>
      <TableCard
        toolbar={
          <>
            <SearchInput
              value={query}
              onChange={setQuery}
              label="Search users"
              placeholder="Search by name or email..."
            />
            <FilterSelect
              value={role}
              onChange={setRole}
              options={roleOptions}
              label="Filter by role"
            />
          </>
        }
      >
        <p aria-live="polite" className="sr-only">
          {visible.length} users
        </p>
        {visible.length ? (
          <table className="w-full min-w-[720px] border-collapse">
            <thead className="bg-pale-sage/60">
              <tr>
                <th scope="col" className={thClass}>User</th>
                <th scope="col" className={thClass}>Role</th>
                <th scope="col" className={thClass}>Status</th>
                <th scope="col" className={thClass}>Joined</th>
                <th scope="col" className={cn(thClass, "text-right")}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {visible.map((user) => {
                const isYou = user.email === currentUserEmail
                return (
                  <tr key={user.id} className={rowClass}>
                    <td className={tdClass}>
                      <div className="flex items-center gap-3">
                        <UserAvatar user={user} />
                        <div className="min-w-0 leading-tight">
                          <p className="truncate text-sm font-semibold text-forest">
                            {user.name}
                            {isYou && (
                              <span className="ml-1.5 text-xs font-normal text-ink-muted">(you)</span>
                            )}
                          </p>
                          <p className="mt-0.5 truncate text-xs text-ink-soft">{user.email}</p>
                        </div>
                      </div>
                    </td>
                    <td className={tdClass}><RoleBadge role={user.role} /></td>
                    <td className={tdClass}><UserStatusBadge status={user.status} /></td>
                    <td className={cn(tdClass, "whitespace-nowrap")}>{formatDate(user.joinedAt)}</td>
                    <td className={cn(tdClass, "text-right")}>
                      {isYou ? (
                        <span aria-label="No actions for your own account" className="text-ink-muted">—</span>
                      ) : (
                        <button
                          type="button"
                          onClick={() => setSelected(user)}
                          aria-label={`View ${user.name}`}
                          className="inline-flex size-9 items-center justify-center rounded-xl text-ink-soft transition-colors hover:bg-forest/10 hover:text-forest focus-visible:outline-2 focus-visible:outline-sage"
                        >
                          <MoreHorizontal aria-hidden className="size-4" />
                        </button>
                      )}
                    </td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        ) : (
          <div className="p-4 pt-0 sm:p-5 sm:pt-0">
            <EmptyState
              icon={Users}
              title="No users found"
              description="Try a different name, email or role filter."
            />
          </div>
        )}
      </TableCard>

      <DetailSheet
        open={selected !== null}
        onOpenChange={(open) => !open && setSelected(null)}
        title="User details"
      >
        {selected && (
          <>
            <div className="flex items-center gap-4">
              <UserAvatar user={selected} className="size-16" />
              <div className="min-w-0 leading-tight">
                <p className="truncate font-[family-name:var(--font-manrope)] text-lg font-extrabold text-forest">
                  {selected.name}
                </p>
                <p className="mt-1 truncate text-sm text-ink-soft">{selected.email}</p>
              </div>
            </div>
            <DetailRows
              rows={[
                { label: "Role", value: <RoleBadge role={selected.role} /> },
                { label: "Status", value: <UserStatusBadge status={selected.status} /> },
                { label: "Joined", value: formatDate(selected.joinedAt) },
                { label: "Phone", value: selected.phone ?? "Not provided" },
                { label: "Area", value: selected.area ?? "Not provided" },
              ]}
            />
            <Button className={cn(btn.lg, btn.primary)} asChild>
              <a href={`mailto:${selected.email}`}>
                <Mail aria-hidden className="size-4" />
                Email user
              </a>
            </Button>
          </>
        )}
      </DetailSheet>
    </>
  )
}