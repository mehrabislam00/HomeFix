"use client"

import { useState } from "react"
import Image from "next/image"
import { format, parseISO } from "date-fns"
import {
  Check,
  CircleCheck,
  ClipboardCheck,
  Clock,
  Loader2,
  Pencil,
  Trash2,
  X,
} from "lucide-react"

import { BlurFade } from "@/components/magic/blur-fade"
import { EmptyState } from "@/components/Dashboard/empty-state"
import { SegmentedFilter } from "@/components/Dashboard/segmented-filter"
import { ServiceApprovalBadge } from "@/components/Dashboard/status-badge"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { Button } from "@/components/ui/button"
import { getAdminService } from "@/lib/Action/admin-actions"
import type {
  AdminService,
  ServiceDecision,
  ServiceDecisionResult,
} from "@/lib/admin-data"
import { btn } from "@/lib/button-styles"
import { initialsOf } from "@/lib/dashboard-data"
import { cn, formatBDT } from "@/lib/utils"

const tabs = [
  { key: "pending", label: "Pending" },
  { key: "approved", label: "Approved" },
  { key: "rejected", label: "Rejected" },
  { key: "all", label: "All" },
] as const

/**
 * Review queue. `onDecision` is the seam for the real approval API: pass a server
 * action returning { ok }. Without it, decisions only update this page's state.
 */
export function ApprovalsList({
  services,
  onDecision,
  onDelete,
  onUpdate,
}: {
  services: AdminService[]
  onDecision: (
    id: string,
    decision: ServiceDecision
  ) => Promise<ServiceDecisionResult>
  onDelete: (id: string) => Promise<ServiceDecisionResult>
  onUpdate: (
    id: string,
    values: Record<string, unknown>
  ) => Promise<ServiceDecisionResult>
}) {
  const [items, setItems] = useState(services)
  const [tab, setTab] = useState<string>("pending")
  const [busyId, setBusyId] = useState<string | null>(null)
  const [editingId, setEditingId] = useState<string | null>(null)
  const [detailBusyId, setDetailBusyId] = useState<string | null>(null)
  const [error, setError] = useState("")
  const [notice, setNotice] = useState("")
  const editing = items.find((service) => service.id === editingId)

  const count = (key: string) =>
    key === "all"
      ? items.length
      : items.filter((s) => s.approval === key).length
  const visible = items.filter((s) => tab === "all" || s.approval === tab)

  async function decide(service: AdminService, decision: ServiceDecision) {
    setBusyId(service.id)
    setError("")
    setNotice("")
    try {
      const result = await onDecision(service.id, decision)
      if (!result.ok) {
        setError(result.error)
        return
      }
      setItems((current) =>
        current.map((s) =>
          s.id === service.id ? { ...s, approval: decision } : s
        )
      )
      setNotice(`"${service.title}" was ${decision}.`)
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Unable to save that decision."
      )
    } finally {
      setBusyId(null)
    }
  }

  async function saveService(formData: FormData) {
    if (!editing) return
    const price = Number(formData.get("price"))
    const approvalStatus = String(formData.get("approvalStatus") ?? "")
    if (!Number.isFinite(price) || price < 0) {
      setError("Enter a valid service price.")
      return
    }
    if (
      approvalStatus !== "pending" &&
      approvalStatus !== "approved" &&
      approvalStatus !== "rejected"
    ) {
      setError("Choose a valid approval status.")
      return
    }
    setBusyId(editing.id)
    setError("")
    setNotice("")
    try {
      const result = await onUpdate(editing.id, {
        title: String(formData.get("title") ?? "").trim(),
        category: String(formData.get("category") ?? "").trim(),
        description: String(formData.get("description") ?? "").trim(),
        basePrice: price,
        estimatedDuration: String(
          formData.get("estimatedDuration") ?? ""
        ).trim(),
        serviceMode: String(formData.get("serviceMode") ?? "").trim(),
        serviceArea: String(formData.get("serviceArea") ?? "").trim(),
        image: String(formData.get("image") ?? "").trim(),
        approvalStatus,
        isAvailable: formData.get("isAvailable") === "on",
      })
      if (!result.ok) {
        setError(result.error)
        return
      }
      setItems((current) =>
        current.map((service) =>
          service.id === editing.id
            ? {
                ...service,
                title: String(formData.get("title") ?? "").trim(),
                category: String(formData.get("category") ?? "").trim(),
                description: String(formData.get("description") ?? "").trim(),
                price,
                estimatedDuration: String(
                  formData.get("estimatedDuration") ?? ""
                ).trim(),
                serviceMode: String(formData.get("serviceMode") ?? "").trim(),
                serviceArea: String(formData.get("serviceArea") ?? "").trim(),
                image:
                  String(formData.get("image") ?? "").trim() || service.image,
                approval: approvalStatus,
                available: formData.get("isAvailable") === "on",
              }
            : service
        )
      )
      setEditingId(null)
      setNotice(`"${editing.title}" was updated.`)
    } catch (saveError) {
      setError(
        saveError instanceof Error
          ? saveError.message
          : "Unable to update this service."
      )
    } finally {
      setBusyId(null)
    }
  }

  async function removeService(service: AdminService) {
    if (!window.confirm(`Permanently delete "${service.title}"?`)) return
    setBusyId(service.id)
    setError("")
    setNotice("")
    try {
      const result = await onDelete(service.id)
      if (!result.ok) {
        setError(result.error)
        return
      }
      setItems((current) => current.filter((item) => item.id !== service.id))
      setNotice(`"${service.title}" was deleted.`)
    } catch (deleteError) {
      setError(
        deleteError instanceof Error
          ? deleteError.message
          : "Unable to delete this service."
      )
    } finally {
      setBusyId(null)
    }
  }

  async function editService(service: AdminService) {
    setDetailBusyId(service.id)
    setError("")
    try {
      const details = await getAdminService(service.id)
      setItems((current) =>
        current.map((item) => (item.id === details.id ? details : item))
      )
      setEditingId(details.id)
    } catch (detailError) {
      setError(
        detailError instanceof Error
          ? detailError.message
          : "Unable to load service details."
      )
    } finally {
      setDetailBusyId(null)
    }
  }

  return (
    <div>
      <SegmentedFilter
        label="Filter services"
        items={tabs.map(({ key, label }) => ({
          key,
          label,
          count: count(key),
        }))}
        value={tab}
        onChange={setTab}
      />

      <div aria-live="polite" className="mt-4 empty:hidden">
        {error && (
          <p
            role="alert"
            className="rounded-2xl border border-status-rejected-fg/20 bg-status-rejected-bg px-4 py-3 text-sm font-medium text-status-rejected-fg"
          >
            {error}
          </p>
        )}
        {notice && !error && (
          <p
            role="status"
            className="inline-flex items-center gap-2 rounded-full bg-status-success-bg px-3 py-1.5 text-sm font-medium text-status-success-fg"
          >
            <CircleCheck aria-hidden className="size-4" />
            {notice}
          </p>
        )}
      </div>

      <div className="mt-5 flex flex-col gap-4">
        {visible.length ? (
          visible.map((service, i) => {
            const busy = busyId === service.id
            return (
              <BlurFade
                key={service.id}
                fade={false}
                delay={Math.min(i, 5) * 0.05}
                y={12}
              >
                <article className="glass-card group relative flex flex-col overflow-hidden rounded-[1.75rem] sm:flex-row">
                  <div className="relative h-44 shrink-0 sm:h-auto sm:w-52">
                    <Image
                      src={service.image}
                      alt=""
                      fill
                      sizes="(min-width: 640px) 208px, 100vw"
                      unoptimized={typeof service.image === "string"}
                      className="object-cover transition-transform duration-500 group-hover:scale-105 motion-reduce:transition-none"
                    />
                  </div>
                  <div className="flex min-w-0 flex-1 flex-col gap-3 p-5 sm:p-6">
                    <div className="flex flex-wrap items-center gap-2.5">
                      <span className="text-xs font-semibold text-sage-deep">
                        {service.category}
                      </span>
                      <ServiceApprovalBadge status={service.approval} />
                    </div>
                    <div>
                      <h3 className="font-[family-name:var(--font-manrope)] text-lg font-bold tracking-tight text-forest">
                        {service.title}
                      </h3>
                      <p className="mt-1 line-clamp-2 text-sm text-ink-soft">
                        {service.description}
                      </p>
                    </div>
                    <div className="flex flex-wrap items-center gap-x-5 gap-y-2 text-sm text-ink-soft">
                      <span className="flex items-center gap-2">
                        <Avatar size="sm" className="size-7">
                          <AvatarFallback className="bg-sage text-[10px] font-semibold text-white">
                            {initialsOf(service.technician)}
                          </AvatarFallback>
                        </Avatar>
                        <strong className="font-semibold text-ink">
                          {service.technician}
                        </strong>
                      </span>
                      <span>
                        <strong className="font-semibold text-ink">
                          {formatBDT(service.price)}
                        </strong>{" "}
                        /visit
                      </span>
                      {service.bookingCount !== undefined && (
                        <span>{service.bookingCount} bookings</span>
                      )}
                      <span className="flex items-center gap-1.5">
                        <Clock aria-hidden className="size-3.5" />
                        {service.submittedAt
                          ? `Submitted ${format(parseISO(service.submittedAt), "MMM d, yyyy")}`
                          : "Submission date unavailable"}
                      </span>
                    </div>
                    <div className="mt-auto flex flex-wrap gap-2 border-t border-forest/10 pt-4">
                      {service.approval === "pending" && (
                        <>
                          <Button
                            type="button"
                            disabled={busy}
                            onClick={() => decide(service, "rejected")}
                            className={cn(
                              btn.md,
                              btn.outline,
                              "bg-white/70 text-status-rejected-fg hover:bg-status-rejected-bg"
                            )}
                          >
                            <X aria-hidden className="size-4" />
                            Reject
                          </Button>
                          <Button
                            type="button"
                            disabled={busy}
                            onClick={() => decide(service, "approved")}
                            className={cn(btn.md, btn.primary)}
                          >
                            {busy ? (
                              <Loader2
                                aria-hidden
                                className="size-4 animate-spin"
                              />
                            ) : (
                              <Check aria-hidden className="size-4" />
                            )}
                            Approve
                          </Button>
                        </>
                      )}
                      <Button
                        type="button"
                        disabled={busy || detailBusyId === service.id}
                        onClick={() => void editService(service)}
                        className={cn(btn.md, btn.outline)}
                      >
                        {detailBusyId === service.id ? (
                          <Loader2
                            aria-hidden
                            className="size-4 animate-spin"
                          />
                        ) : (
                          <Pencil aria-hidden className="size-4" />
                        )}
                        Edit
                      </Button>
                      <Button
                        type="button"
                        disabled={busy}
                        onClick={() => void removeService(service)}
                        className={cn(
                          btn.md,
                          btn.outline,
                          "text-status-rejected-fg"
                        )}
                      >
                        <Trash2 aria-hidden className="size-4" />
                        Delete
                      </Button>
                    </div>
                    {editingId === service.id && (
                      <form
                        className="mt-4 grid gap-3 border-t border-forest/10 pt-4 sm:grid-cols-2"
                        onSubmit={(event) => {
                          event.preventDefault()
                          void saveService(new FormData(event.currentTarget))
                        }}
                      >
                        <label className="text-xs font-medium text-ink-soft">
                          Title
                          <input
                            name="title"
                            defaultValue={service.title}
                            required
                            className="mt-1 h-10 w-full rounded-xl border border-forest/15 bg-white px-3 text-sm text-ink"
                          />
                        </label>
                        <label className="text-xs font-medium text-ink-soft">
                          Category
                          <input
                            name="category"
                            defaultValue={service.category}
                            required
                            className="mt-1 h-10 w-full rounded-xl border border-forest/15 bg-white px-3 text-sm text-ink"
                          />
                        </label>
                        <label className="text-xs font-medium text-ink-soft">
                          Price (BDT)
                          <input
                            name="price"
                            type="number"
                            min="0"
                            step="0.01"
                            defaultValue={service.price}
                            required
                            className="mt-1 h-10 w-full rounded-xl border border-forest/15 bg-white px-3 text-sm text-ink"
                          />
                        </label>
                        <label className="text-xs font-medium text-ink-soft">
                          Approval
                          <select
                            name="approvalStatus"
                            defaultValue={service.approval}
                            className="mt-1 h-10 w-full rounded-xl border border-forest/15 bg-white px-3 text-sm text-ink"
                          >
                            <option value="pending">Pending</option>
                            <option value="approved">Approved</option>
                            <option value="rejected">Rejected</option>
                          </select>
                        </label>
                        <label className="text-xs font-medium text-ink-soft">
                          Duration
                          <input
                            name="estimatedDuration"
                            defaultValue={service.estimatedDuration ?? ""}
                            className="mt-1 h-10 w-full rounded-xl border border-forest/15 bg-white px-3 text-sm text-ink"
                          />
                        </label>
                        <label className="text-xs font-medium text-ink-soft">
                          Service mode
                          <input
                            name="serviceMode"
                            defaultValue={service.serviceMode ?? ""}
                            className="mt-1 h-10 w-full rounded-xl border border-forest/15 bg-white px-3 text-sm text-ink"
                          />
                        </label>
                        <label className="text-xs font-medium text-ink-soft sm:col-span-2">
                          Service area
                          <input
                            name="serviceArea"
                            defaultValue={service.serviceArea ?? ""}
                            className="mt-1 h-10 w-full rounded-xl border border-forest/15 bg-white px-3 text-sm text-ink"
                          />
                        </label>
                        <label className="text-xs font-medium text-ink-soft sm:col-span-2">
                          Image URL
                          <input
                            name="image"
                            defaultValue={
                              typeof service.image === "string"
                                ? service.image
                                : ""
                            }
                            className="mt-1 h-10 w-full rounded-xl border border-forest/15 bg-white px-3 text-sm text-ink"
                          />
                        </label>
                        <label className="text-xs font-medium text-ink-soft sm:col-span-2">
                          Description
                          <textarea
                            name="description"
                            defaultValue={service.description}
                            required
                            className="mt-1 min-h-20 w-full rounded-xl border border-forest/15 bg-white px-3 py-2 text-sm text-ink"
                          />
                        </label>
                        <label className="flex items-center gap-2 text-sm text-ink-soft sm:col-span-2">
                          <input
                            name="isAvailable"
                            type="checkbox"
                            defaultChecked={service.available}
                          />
                          Available for customer bookings
                        </label>
                        <div className="flex gap-2 sm:col-span-2">
                          <Button
                            type="submit"
                            disabled={busy}
                            className={cn(btn.md, btn.primary)}
                          >
                            {busy ? (
                              <Loader2
                                aria-hidden
                                className="size-4 animate-spin"
                              />
                            ) : null}
                            Save service
                          </Button>
                          <Button
                            type="button"
                            disabled={busy}
                            onClick={() => setEditingId(null)}
                            className={cn(btn.md, btn.outline)}
                          >
                            Cancel
                          </Button>
                        </div>
                      </form>
                    )}
                  </div>
                </article>
              </BlurFade>
            )
          })
        ) : (
          <div className="glass-card relative rounded-[1.75rem] p-4 sm:p-6">
            <EmptyState
              icon={ClipboardCheck}
              title={
                tab === "pending" ? "Nothing to review" : "No services here"
              }
              description={
                tab === "pending"
                  ? "New technician submissions will appear here for approval."
                  : "Nothing matches this filter yet."
              }
            />
          </div>
        )}
      </div>
    </div>
  )
}
