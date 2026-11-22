import type { AdminRole, UserStatus } from "@/lib/admin-data"
import { Pill } from "@/components/Dashboard/status-badge"

const roleMap = {
  customer: { label: "Customer", tone: "gray" },
  technician: { label: "Technician", tone: "blue" },
} as const

export function RoleBadge({ role }: { role: AdminRole }) {
  if (role === "admin") {
    return (
      <span className="inline-flex h-6 items-center gap-1.5 rounded-full bg-forest px-2.5 text-xs leading-none font-semibold whitespace-nowrap text-white">
        <span aria-hidden className="size-1.5 rounded-full bg-current opacity-80" />
        Admin
      </span>
    )
  }
  return <Pill {...roleMap[role]} />
}

export function UserStatusBadge({ status }: { status: UserStatus }) {
  return status === "active" ? (
    <Pill label="Active" tone="green" />
  ) : (
    <Pill label="Suspended" tone="red" />
  )
}