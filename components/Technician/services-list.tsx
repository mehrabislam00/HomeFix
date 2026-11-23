"use client"

import { useState, type FormEvent } from "react"
import Image from "next/image"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { Pencil, Trash2, Wrench } from "lucide-react"
import { format, parseISO } from "date-fns"

import { BlurFade } from "@/components/magic/blur-fade"
import { EmptyState } from "@/components/Dashboard/empty-state"
import { ServiceApprovalBadge } from "@/components/Dashboard/status-badge"
import { AuthError } from "@/components/auth/auth-submit"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { NativeSelect, NativeSelectOption } from "@/components/ui/native-select"
import { Switch } from "@/components/ui/switch"
import { Textarea } from "@/components/ui/textarea"
import { btn } from "@/lib/button-styles"
import { serviceCategories } from "@/lib/services-data"
import { SERVICE_DESCRIPTION_MAX } from "@/lib/technician-data"
import type {
  NewServiceResult,
  ServiceUpdateValues,
  TechnicianService,
} from "@/lib/technician-data"
import { cn, formatBDT } from "@/lib/utils"
import { SegmentedFilter } from "../Dashboard/segmented-filter"

const tabs = [
  { key: "all", label: "All" },
  { key: "approved", label: "Approved" },
  { key: "pending", label: "Pending" },
  { key: "rejected", label: "Rejected" },
] as const

const categories = serviceCategories.filter(
  (category) => category.slug !== "all"
)

export type ServiceActions = {
  onToggleAvailable?: (
    id: string,
    available: boolean
  ) => Promise<NewServiceResult>
  onUpdate?: (
    id: string,
    values: ServiceUpdateValues
  ) => Promise<NewServiceResult>
  onDelete?: (id: string) => Promise<NewServiceResult>
}

function ServiceCard({
  service,
  actions,
  busy,
  onToggleAvailable,
  onEdit,
  onDelete,
}: {
  service: TechnicianService
  actions: ServiceActions
  busy: boolean
  onToggleAvailable: (available: boolean) => void
  onEdit: () => void
  onDelete: () => void
}) {
  const { title, category, price, image, approval, available, createdAt } =
    service
  const added = createdAt
    ? format(parseISO(createdAt), "MMM d, yyyy")
    : "date unavailable"

  return (
    <div className="glass-card group relative flex h-full w-full flex-col overflow-hidden rounded-3xl hover:-translate-y-1 motion-reduce:hover:translate-y-0">
      <div className="relative aspect-[16/10] w-full overflow-hidden bg-card-tint">
        <Image
          src={image}
          alt={title}
          fill
          unoptimized={typeof image === "string"}
          sizes="(min-width: 1280px) 30vw, (min-width: 640px) 45vw, 100vw"
          className="object-cover transition-transform duration-700 ease-out group-hover:scale-105 motion-reduce:transition-none"
        />
        <ServiceApprovalBadge
          status={approval}
          className="absolute top-3 left-3 shadow-sm backdrop-blur-md"
        />
      </div>

      <div className="flex flex-1 flex-col p-4 sm:p-5">
        <p className="text-xs font-semibold text-sage-deep">{category}</p>
        <h3 className="mt-1 font-[family-name:var(--font-manrope)] text-lg leading-tight font-bold tracking-tight text-forest">
          {title}
        </h3>
        <p className="mt-1.5 text-sm text-ink-soft">
          <strong className="font-semibold text-ink">{formatBDT(price)}</strong>{" "}
          per visit · added {added}
        </p>

        <label className="mt-4 flex items-center justify-between gap-3 rounded-2xl border border-white/80 bg-white/60 px-3.5 py-2.5 text-sm font-medium text-forest">
          Available
          <Switch
            checked={available}
            disabled={!actions.onToggleAvailable || busy}
            onCheckedChange={onToggleAvailable}
            aria-label={`${title} availability`}
          />
        </label>

        <div className="mt-auto grid grid-cols-2 gap-2 pt-4">
          <Button
            type="button"
            disabled={!actions.onUpdate || busy}
            onClick={onEdit}
            className={cn(
              btn.md,
              "border border-white/80 bg-white/70 text-forest shadow-[inset_0_1px_0_rgb(255_255_255/0.9)] hover:bg-forest hover:text-white"
            )}
          >
            <Pencil aria-hidden className="size-4" />
            Edit
          </Button>
          <Button
            type="button"
            disabled={!actions.onDelete || busy}
            onClick={onDelete}
            className={cn(
              btn.md,
              "border border-white/80 bg-white/70 text-status-rejected-fg shadow-[inset_0_1px_0_rgb(255_255_255/0.9)] hover:bg-status-rejected-bg"
            )}
          >
            <Trash2 aria-hidden className="size-4" />
            Delete
          </Button>
        </div>
      </div>
    </div>
  )
}

export function ServicesList({
  services,
  actions = {},
}: {
  services: TechnicianService[]
  actions?: ServiceActions
}) {
  const router = useRouter()
  const [tab, setTab] = useState<string>("all")
  const [editing, setEditing] = useState<TechnicianService | null>(null)
  const [editAvailable, setEditAvailable] = useState(true)
  const [busyId, setBusyId] = useState<string | null>(null)
  const [error, setError] = useState("")
  const [success, setSuccess] = useState("")
  const countOf = (key: string) =>
    key === "all"
      ? services.length
      : services.filter((service) => service.approval === key).length
  const visible = services.filter(
    (service) => tab === "all" || service.approval === tab
  )

  function startEditing(service: TechnicianService) {
    setEditing(service)
    setEditAvailable(service.available)
    setError("")
    setSuccess("")
  }

  async function finishAction(
    id: string,
    action: () => Promise<NewServiceResult>,
    message: string
  ) {
    setBusyId(id)
    setError("")
    setSuccess("")
    try {
      const result = await action()
      if (!result.ok) {
        setError(result.error)
        return false
      }
      setSuccess(message)
      router.refresh()
      return true
    } catch (actionError) {
      setError(
        actionError instanceof Error
          ? actionError.message
          : "Unable to update this service. Please try again."
      )
      return false
    } finally {
      setBusyId(null)
    }
  }

  async function saveEdit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    if (!editing || !actions.onUpdate) return
    const data = new FormData(event.currentTarget)
    const values: ServiceUpdateValues = {
      title: String(data.get("title") ?? "").trim(),
      category: String(data.get("category") ?? ""),
      price: Number(data.get("price")),
      description: String(data.get("description") ?? "").trim(),
      availability: String(data.get("availability") ?? "").trim(),
      acceptingBookings: editAvailable,
    }
    if (
      !values.title ||
      !values.category ||
      values.description.length < 20 ||
      values.description.length > SERVICE_DESCRIPTION_MAX ||
      !Number.isFinite(values.price) ||
      values.price <= 0
    ) {
      setError("Enter a name, category, description and valid price.")
      return
    }
    const saved = await finishAction(
      editing.id,
      () => actions.onUpdate!(editing.id, values),
      "Service updated."
    )
    if (saved) setEditing(null)
  }

  async function removeService(service: TechnicianService) {
    if (!actions.onDelete || !window.confirm(`Delete "${service.title}"?`)) {
      return
    }
    await finishAction(
      service.id,
      () => actions.onDelete!(service.id),
      "Service deleted."
    )
  }

  return (
    <div>
      {!editing && <AuthError message={error} />}
      {success && (
        <p
          role="status"
          className="mb-4 rounded-2xl border border-status-success-fg/20 bg-status-success-bg p-4 text-sm font-medium text-status-success-fg"
        >
          {success}
        </p>
      )}
      <SegmentedFilter
        label="Filter services"
        value={tab}
        onChange={setTab}
        items={tabs.map(({ key, label }) => ({
          key,
          label,
          count: countOf(key),
        }))}
      />

      <p aria-live="polite" className="sr-only">
        {visible.length} services
      </p>

      {visible.length ? (
        <ul className="mt-5 grid gap-4 sm:grid-cols-2 sm:gap-5 xl:grid-cols-3">
          {visible.map((service, i) => (
            <li key={service.id} className="flex">
              <BlurFade
                fade={false}
                delay={Math.min(i, 5) * 0.06}
                y={16}
                className="flex w-full"
              >
                <ServiceCard
                  service={service}
                  actions={actions}
                  busy={busyId === service.id}
                  onToggleAvailable={(next) => {
                    if (!actions.onToggleAvailable) return
                    void finishAction(
                      service.id,
                      () => actions.onToggleAvailable!(service.id, next),
                      "Availability updated."
                    )
                  }}
                  onEdit={() => startEditing(service)}
                  onDelete={() => removeService(service)}
                />
              </BlurFade>
            </li>
          ))}
        </ul>
      ) : (
        <div className="glass-card relative mt-5 rounded-[1.75rem] p-4 sm:p-6">
          <EmptyState
            icon={Wrench}
            title={
              tab === "all" ? "No services created yet" : `No ${tab} services`
            }
            description={
              tab === "all"
                ? "Create your first service to start receiving bookings."
                : "Nothing matches this filter yet."
            }
            action={
              tab === "all" && (
                <Button className={cn(btn.md, btn.primary)} asChild>
                  <Link href="/technician-dashboard/add-service">
                    Add your first service
                  </Link>
                </Button>
              )
            }
          />
        </div>
      )}

      {editing && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center overflow-y-auto bg-forest/40 p-4 backdrop-blur-sm"
          role="presentation"
          onMouseDown={(event) => {
            if (event.target === event.currentTarget && !busyId) {
              setEditing(null)
              setError("")
            }
          }}
        >
          <section
            role="dialog"
            aria-modal="true"
            aria-labelledby="edit-service-title"
            className="glass-card relative my-auto w-full max-w-2xl rounded-[1.75rem] p-5 sm:p-8"
          >
            <h2
              id="edit-service-title"
              className="font-[family-name:var(--font-manrope)] text-2xl font-extrabold text-forest"
            >
              Edit service
            </h2>
            <form onSubmit={saveEdit} className="mt-5 flex flex-col gap-4">
              <AuthError message={error} />
              <div>
                <Label htmlFor="edit-service-name">Service name</Label>
                <Input
                  id="edit-service-name"
                  name="title"
                  required
                  defaultValue={editing.title}
                  className="mt-2"
                />
              </div>
              <div className="grid gap-4 sm:grid-cols-2">
                <div>
                  <Label htmlFor="edit-service-category">Category</Label>
                  <NativeSelect
                    id="edit-service-category"
                    name="category"
                    defaultValue={editing.category}
                    className="mt-2 w-full [&_select]:h-10 [&_select]:rounded-md [&_select]:border [&_select]:border-input [&_select]:bg-background [&_select]:px-3"
                  >
                    {!categories.some(
                      (category) => category.label === editing.category
                    ) && (
                      <NativeSelectOption value={editing.category}>
                        {editing.category}
                      </NativeSelectOption>
                    )}
                    {categories.map((category) => (
                      <NativeSelectOption
                        key={category.slug}
                        value={category.label}
                      >
                        {category.label}
                      </NativeSelectOption>
                    ))}
                  </NativeSelect>
                </div>
                <div>
                  <Label htmlFor="edit-service-price">Price (BDT)</Label>
                  <Input
                    id="edit-service-price"
                    name="price"
                    type="number"
                    min="1"
                    step="any"
                    required
                    defaultValue={editing.price}
                    className="mt-2"
                  />
                </div>
              </div>
              <div>
                <Label htmlFor="edit-service-description">Description</Label>
                <Textarea
                  id="edit-service-description"
                  name="description"
                  required
                  defaultValue={editing.description ?? ""}
                  rows={4}
                  className="mt-2"
                />
              </div>
              <div>
                <Label htmlFor="edit-service-availability">Availability</Label>
                <Input
                  id="edit-service-availability"
                  name="availability"
                  defaultValue={editing.availability}
                  className="mt-2"
                />
              </div>
              <label className="flex items-center justify-between gap-4 rounded-2xl border border-white/80 bg-white/60 px-4 py-3 text-sm font-medium text-forest">
                Accepting bookings
                <Switch
                  checked={editAvailable}
                  onCheckedChange={setEditAvailable}
                  aria-label="Accepting bookings"
                />
              </label>
              <div className="flex justify-end gap-3">
                <Button
                  type="button"
                  disabled={Boolean(busyId)}
                  onClick={() => {
                    setEditing(null)
                    setError("")
                  }}
                  className={cn(btn.md, btn.outline)}
                >
                  Cancel
                </Button>
                <Button
                  type="submit"
                  disabled={Boolean(busyId)}
                  className={cn(btn.md, btn.primary)}
                >
                  {busyId ? "Saving..." : "Save changes"}
                </Button>
              </div>
            </form>
          </section>
        </div>
      )}
    </div>
  )
}
