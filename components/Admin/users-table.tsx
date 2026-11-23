"use client"

import { useState } from "react"
import { format, parseISO } from "date-fns"
import { Ban, Loader2, Mail, MoreHorizontal, Trash2, Users } from "lucide-react"

import { EmptyState } from "@/components/Dashboard/empty-state"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Button } from "@/components/ui/button"
import {
  deleteAdminCustomer,
  deleteAdminTechnician,
  deleteAdminUser,
  getAdminCustomer,
  getAdminCustomerBookings,
  getAdminTechnician,
  getAdminTechnicianBookings,
  getAdminTechnicianServices,
  getAdminUser,
  getAdminUserActivity,
  setAdminUserBanned,
  updateAdminCustomer,
  updateAdminTechnician,
  updateAdminUser,
} from "@/lib/Action/admin-actions"
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

const fieldClass =
  "h-10 w-full rounded-xl border border-forest/15 bg-white/80 px-3 text-sm text-ink outline-none focus-visible:border-sage focus-visible:ring-4 focus-visible:ring-sage/20"
const labelClass = "flex flex-col gap-1.5 text-xs font-medium text-ink-soft"
const formatDate = (iso: string) =>
  iso ? format(parseISO(iso), "MMM d, yyyy") : "—"
const splitList = (value: string) =>
  value
    .split(",")
    .map((item) => item.trim())
    .filter(Boolean)

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value)
}

type UserForm = {
  name: string
  image: string
  phone: string
  area: string
  bio: string
  emailVerified: boolean
  skills: string
  serviceCategories: string
  experience: string
  availability: string
}

const userForm = (user: AdminUser): UserForm => ({
  name: user.name,
  image: user.image ?? "",
  phone: user.phone ?? "",
  area: user.area ?? "",
  bio: user.bio ?? "",
  emailVerified: user.emailVerified === true,
  skills: user.skills?.join(", ") ?? "",
  serviceCategories: user.serviceCategories?.join(", ") ?? "",
  experience: user.experience === undefined ? "" : String(user.experience),
  availability: JSON.stringify(user.availability ?? {}, null, 2),
})

function UserAvatar({
  user,
  className,
}: {
  user: AdminUser
  className?: string
}) {
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
  users: initialUsers,
  currentUserEmail,
}: {
  users: AdminUser[]
  currentUserEmail: string
}) {
  const [users, setUsers] = useState(initialUsers)
  const [query, setQuery] = useState("")
  const [role, setRole] = useState("all")
  const [selected, setSelected] = useState<AdminUser | null>(null)
  const [form, setForm] = useState<UserForm | null>(null)
  const [busy, setBusy] = useState(false)
  const [loadingDetails, setLoadingDetails] = useState(false)
  const [activity, setActivity] = useState<{
    bookingCount: number
    completedBookingCount: number
    services: { id: string; title: string; approval: string }[]
    bookings: { id: string; serviceTitle: string; status: string }[]
  } | null>(null)
  const [error, setError] = useState("")
  const [notice, setNotice] = useState("")

  const needle = query.trim().toLowerCase()
  const visible = users.filter(
    (user) =>
      (role === "all" || user.role === role) &&
      (!needle ||
        user.name.toLowerCase().includes(needle) ||
        user.email.toLowerCase().includes(needle))
  )

  async function openUser(user: AdminUser) {
    setSelected(user)
    setForm(userForm(user))
    setActivity(null)
    setError("")
    setNotice("")
    setLoadingDetails(true)
    try {
      if (user.role === "customer") {
        const [details, bookings, userActivity] = await Promise.all([
          getAdminCustomer(user.id),
          getAdminCustomerBookings(user.id),
          getAdminUserActivity(user.id),
        ])
        setSelected(details)
        setForm(userForm(details))
        setActivity({
          bookingCount: bookings.length,
          completedBookingCount: bookings.filter(
            (booking) => booking.status === "completed"
          ).length,
          services: [],
          bookings: bookings.slice(0, 5).map((booking) => ({
            id: booking.id,
            serviceTitle: booking.serviceTitle,
            status: booking.status,
          })),
        })
        if (userActivity.user.id !== user.id) {
          throw new Error(
            "The customer activity response did not match the user."
          )
        }
      } else if (user.role === "technician") {
        const [details, bookings, services, userActivity] = await Promise.all([
          getAdminTechnician(user.id),
          getAdminTechnicianBookings(user.id),
          getAdminTechnicianServices(user.id),
          getAdminUserActivity(user.id),
        ])
        setSelected(details)
        setForm(userForm(details))
        setActivity({
          bookingCount: bookings.length,
          completedBookingCount: bookings.filter(
            (booking) => booking.status === "completed"
          ).length,
          services: services.map((service) => ({
            id: service.id,
            title: service.title,
            approval: service.approval,
          })),
          bookings: bookings.slice(0, 5).map((booking) => ({
            id: booking.id,
            serviceTitle: booking.serviceTitle,
            status: booking.status,
          })),
        })
        if (userActivity.user.id !== user.id) {
          throw new Error(
            "The technician activity response did not match the user."
          )
        }
      } else {
        const [details, userActivity] = await Promise.all([
          getAdminUser(user.id),
          getAdminUserActivity(user.id),
        ])
        setSelected(details)
        setForm(userForm(details))
        setActivity({
          bookingCount: userActivity.bookingCount,
          completedBookingCount: userActivity.completedBookingCount,
          services: [],
          bookings: userActivity.bookings.slice(0, 5).map((booking) => ({
            id: booking.id,
            serviceTitle: booking.serviceTitle,
            status: booking.status,
          })),
        })
      }
    } catch (detailError) {
      setError(
        detailError instanceof Error
          ? detailError.message
          : "Unable to load account details."
      )
    } finally {
      setLoadingDetails(false)
    }
  }

  async function saveUser() {
    if (!selected || !form) return
    setBusy(true)
    setError("")
    setNotice("")
    const values: Record<string, unknown> = {
      name: form.name.trim(),
      image: form.image.trim(),
      phone: form.phone.trim(),
      area: form.area.trim(),
      bio: form.bio.trim(),
    }
    let availability: Record<string, unknown> | undefined
    if (selected.role === "admin") {
      values.emailVerified = form.emailVerified
    }
    if (selected.role === "technician") {
      const experience = Number(form.experience)
      if (!Number.isFinite(experience) || experience < 0) {
        setBusy(false)
        setError("Enter a valid technician experience value.")
        return
      }
      values.skills = splitList(form.skills)
      values.serviceCategories = splitList(form.serviceCategories)
      values.experience = experience
      let parsedAvailability: unknown
      try {
        parsedAvailability = JSON.parse(form.availability)
      } catch {
        setBusy(false)
        setError("Availability must be valid JSON.")
        return
      }
      if (!isRecord(parsedAvailability)) {
        setBusy(false)
        setError("Availability must be a JSON object.")
        return
      }
      availability = parsedAvailability
      values.availability = availability
    }

    try {
      const result =
        selected.role === "customer"
          ? await updateAdminCustomer(selected.id, values)
          : selected.role === "technician"
            ? await updateAdminTechnician(selected.id, values)
            : await updateAdminUser(selected.id, values)
      if (!result.ok) {
        setError(result.error)
        return
      }
      const updated: AdminUser = {
        ...selected,
        name: form.name.trim(),
        image: form.image.trim() || undefined,
        phone: form.phone.trim(),
        area: form.area.trim(),
        bio: form.bio.trim(),
        ...(selected.role === "admin"
          ? { emailVerified: form.emailVerified }
          : {}),
        ...(selected.role === "technician"
          ? {
              skills: splitList(form.skills),
              serviceCategories: splitList(form.serviceCategories),
              experience: Number(form.experience),
              availability,
            }
          : {}),
      }
      setSelected(updated)
      setForm(userForm(updated))
      setUsers((current) =>
        current.map((user) => (user.id === updated.id ? updated : user))
      )
      setNotice("User details were saved.")
    } catch (saveError) {
      setError(
        saveError instanceof Error
          ? saveError.message
          : "Unable to save user details."
      )
    } finally {
      setBusy(false)
    }
  }

  async function toggleBanned() {
    if (!selected) return
    setBusy(true)
    setError("")
    setNotice("")
    try {
      const banned = selected.status !== "suspended"
      const result = await setAdminUserBanned(selected.id, banned)
      if (!result.ok) {
        setError(result.error)
        return
      }
      const updated = {
        ...selected,
        banned,
        status: banned ? ("suspended" as const) : ("active" as const),
      }
      setSelected(updated)
      setUsers((current) =>
        current.map((user) => (user.id === updated.id ? updated : user))
      )
      setNotice(
        banned ? "User access was suspended." : "User access was restored."
      )
    } catch (banError) {
      setError(
        banError instanceof Error
          ? banError.message
          : "Unable to update user access."
      )
    } finally {
      setBusy(false)
    }
  }

  async function removeUser() {
    if (!selected || !window.confirm(`Permanently delete ${selected.name}?`)) {
      return
    }
    setBusy(true)
    setError("")
    setNotice("")
    try {
      const result =
        selected.role === "customer"
          ? await deleteAdminCustomer(selected.id)
          : selected.role === "technician"
            ? await deleteAdminTechnician(selected.id)
            : await deleteAdminUser(selected.id)
      if (!result.ok) {
        setError(result.error)
        return
      }
      setUsers((current) => current.filter((user) => user.id !== selected.id))
      setNotice("User account was deleted.")
      setSelected(null)
    } catch (deleteError) {
      setError(
        deleteError instanceof Error
          ? deleteError.message
          : "Unable to delete the user."
      )
    } finally {
      setBusy(false)
    }
  }

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
                <th scope="col" className={thClass}>
                  User
                </th>
                <th scope="col" className={thClass}>
                  Role
                </th>
                <th scope="col" className={thClass}>
                  Status
                </th>
                <th scope="col" className={thClass}>
                  Joined
                </th>
                <th scope="col" className={cn(thClass, "text-right")}>
                  Actions
                </th>
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
                              <span className="ml-1.5 text-xs font-normal text-ink-muted">
                                (you)
                              </span>
                            )}
                          </p>
                          <p className="mt-0.5 truncate text-xs text-ink-soft">
                            {user.email}
                          </p>
                        </div>
                      </div>
                    </td>
                    <td className={tdClass}>
                      <RoleBadge role={user.role} />
                    </td>
                    <td className={tdClass}>
                      <UserStatusBadge status={user.status} />
                    </td>
                    <td className={cn(tdClass, "whitespace-nowrap")}>
                      {formatDate(user.joinedAt)}
                    </td>
                    <td className={cn(tdClass, "text-right")}>
                      {isYou ? (
                        <span
                          aria-label="No actions for your own account"
                          className="text-ink-muted"
                        >
                          —
                        </span>
                      ) : (
                        <button
                          type="button"
                          onClick={() => void openUser(user)}
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
      {notice && !selected && (
        <p
          role="status"
          className="rounded-2xl bg-status-success-bg px-4 py-3 text-sm font-medium text-status-success-fg"
        >
          {notice}
        </p>
      )}

      <DetailSheet
        open={selected !== null}
        onOpenChange={(open) => {
          if (!open) setSelected(null)
        }}
        title="User details"
      >
        {selected && form && (
          <>
            <div className="flex items-center gap-4">
              <UserAvatar user={selected} className="size-16" />
              <div className="min-w-0 leading-tight">
                <p className="truncate font-[family-name:var(--font-manrope)] text-lg font-extrabold text-forest">
                  {selected.name}
                </p>
                <p className="mt-1 truncate text-sm text-ink-soft">
                  {selected.email}
                </p>
              </div>
            </div>
            <DetailRows
              rows={[
                { label: "Role", value: <RoleBadge role={selected.role} /> },
                {
                  label: "Status",
                  value: <UserStatusBadge status={selected.status} />,
                },
                { label: "Joined", value: formatDate(selected.joinedAt) },
                {
                  label: "Email verified",
                  value: selected.emailVerified ? "Yes" : "No",
                },
              ]}
            />
            {loadingDetails ? (
              <p role="status" className="text-sm text-ink-soft">
                Loading account activity…
              </p>
            ) : activity ? (
              <DetailRows
                rows={[
                  { label: "Bookings", value: activity.bookingCount },
                  {
                    label: "Completed bookings",
                    value: activity.completedBookingCount,
                  },
                  ...(selected.role === "technician"
                    ? [{ label: "Services", value: activity.services.length }]
                    : []),
                ]}
              />
            ) : null}
            {activity?.services.length ? (
              <div className="flex flex-col gap-2">
                <p className="text-xs font-semibold tracking-wide text-ink-muted uppercase">
                  Technician services
                </p>
                {activity.services.slice(0, 5).map((service) => (
                  <p key={service.id} className="text-sm text-ink">
                    {service.title} · {service.approval}
                  </p>
                ))}
              </div>
            ) : null}
            {activity?.bookings.length ? (
              <div className="flex flex-col gap-2">
                <p className="text-xs font-semibold tracking-wide text-ink-muted uppercase">
                  Recent bookings
                </p>
                {activity.bookings.map((booking) => (
                  <p key={booking.id} className="text-sm text-ink">
                    {booking.serviceTitle} ·{" "}
                    {booking.status.replaceAll("_", " ")}
                  </p>
                ))}
              </div>
            ) : null}
            <form
              className="flex flex-col gap-3"
              onSubmit={(event) => {
                event.preventDefault()
                void saveUser()
              }}
            >
              <label className={labelClass}>
                Name
                <input
                  className={fieldClass}
                  value={form.name}
                  onChange={(event) =>
                    setForm({ ...form, name: event.target.value })
                  }
                  required
                />
              </label>
              <label className={labelClass}>
                Profile image URL
                <input
                  className={fieldClass}
                  value={form.image}
                  onChange={(event) =>
                    setForm({ ...form, image: event.target.value })
                  }
                />
              </label>
              <label className={labelClass}>
                Phone
                <input
                  className={fieldClass}
                  value={form.phone}
                  onChange={(event) =>
                    setForm({ ...form, phone: event.target.value })
                  }
                />
              </label>
              <label className={labelClass}>
                Area
                <input
                  className={fieldClass}
                  value={form.area}
                  onChange={(event) =>
                    setForm({ ...form, area: event.target.value })
                  }
                />
              </label>
              <label className={labelClass}>
                Bio
                <textarea
                  className={`${fieldClass} h-20 py-2`}
                  value={form.bio}
                  onChange={(event) =>
                    setForm({ ...form, bio: event.target.value })
                  }
                />
              </label>
              {selected.role === "technician" && (
                <>
                  <label className={labelClass}>
                    Skills (comma-separated)
                    <input
                      className={fieldClass}
                      value={form.skills}
                      onChange={(event) =>
                        setForm({ ...form, skills: event.target.value })
                      }
                    />
                  </label>
                  <label className={labelClass}>
                    Service categories (comma-separated)
                    <input
                      className={fieldClass}
                      value={form.serviceCategories}
                      onChange={(event) =>
                        setForm({
                          ...form,
                          serviceCategories: event.target.value,
                        })
                      }
                    />
                  </label>
                  <label className={labelClass}>
                    Experience (years)
                    <input
                      className={fieldClass}
                      type="number"
                      min="0"
                      step="1"
                      value={form.experience}
                      onChange={(event) =>
                        setForm({ ...form, experience: event.target.value })
                      }
                      required
                    />
                  </label>
                  <label className={labelClass}>
                    Availability (JSON object)
                    <textarea
                      className={`${fieldClass} h-24 py-2 font-mono text-xs`}
                      value={form.availability}
                      onChange={(event) =>
                        setForm({ ...form, availability: event.target.value })
                      }
                      required
                    />
                  </label>
                </>
              )}
              {selected.role === "admin" && (
                <label className="flex items-center gap-2 text-sm text-ink-soft">
                  <input
                    type="checkbox"
                    checked={form.emailVerified}
                    onChange={(event) =>
                      setForm({ ...form, emailVerified: event.target.checked })
                    }
                  />
                  Email verified
                </label>
              )}
              {error && (
                <p role="alert" className="text-sm text-status-rejected-fg">
                  {error}
                </p>
              )}
              {notice && (
                <p role="status" className="text-sm text-status-success-fg">
                  {notice}
                </p>
              )}
              <Button
                type="submit"
                className={cn(btn.lg, btn.primary)}
                disabled={busy || loadingDetails}
              >
                {busy && (
                  <Loader2 aria-hidden className="size-4 animate-spin" />
                )}
                Save changes
              </Button>
            </form>
            {selected.email !== currentUserEmail && (
              <div className="flex flex-col gap-2 border-t border-forest/10 pt-4">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => void toggleBanned()}
                  disabled={busy}
                  className={cn(btn.md, btn.outline)}
                >
                  {busy ? (
                    <Loader2 aria-hidden className="size-4 animate-spin" />
                  ) : (
                    <Ban aria-hidden className="size-4" />
                  )}
                  {selected.status === "suspended" ? "Unban user" : "Ban user"}
                </Button>
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => void removeUser()}
                  disabled={busy}
                  className={cn(btn.md, btn.outline, "text-status-rejected-fg")}
                >
                  <Trash2 aria-hidden className="size-4" />
                  Delete account
                </Button>
                <Button className={cn(btn.lg, btn.primary)} asChild>
                  <a href={`mailto:${selected.email}`}>
                    <Mail aria-hidden className="size-4" />
                    Email user
                  </a>
                </Button>
              </div>
            )}
          </>
        )}
      </DetailSheet>
    </>
  )
}
