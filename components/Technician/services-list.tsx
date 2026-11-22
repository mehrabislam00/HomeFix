"use client"

import { useState } from "react"
import Image from "next/image"
import Link from "next/link"
import { Pencil, Trash2, Wrench } from "lucide-react"
import { format, parseISO } from "date-fns"

import { BlurFade } from "@/components/magic/blur-fade"
import { EmptyState } from "@/components/Dashboard/empty-state"

import { ServiceApprovalBadge } from "@/components/Dashboard/status-badge"
import { Button } from "@/components/ui/button"
import { Switch } from "@/components/ui/switch"
import { btn } from "@/lib/button-styles"
import type { TechnicianService } from "@/lib/technician-data"
import { cn, formatBDT } from "@/lib/utils"
import { SegmentedFilter } from "../Dashboard/segmented-filter"

const tabs = [
  { key: "all", label: "All" },
  { key: "approved", label: "Approved" },
  { key: "pending", label: "Pending" },
  { key: "rejected", label: "Rejected" },
] as const

/** Optional handlers — each control stays disabled until its handler exists. */
export type ServiceActions = {
  onToggleAvailable?: (id: string, available: boolean) => void
  onEdit?: (id: string) => void
  onDelete?: (id: string) => void
}

function ServiceCard({
  service,
  actions,
}: {
  service: TechnicianService
  actions: ServiceActions
}) {
  const { id, title, category, price, image, approval, available, createdAt } =
    service
  return (
    <div className="glass-card group relative flex h-full w-full flex-col overflow-hidden rounded-3xl hover:-translate-y-1 motion-reduce:hover:translate-y-0">
      <div className="relative aspect-[16/10] w-full overflow-hidden bg-card-tint">
        <Image
          src={image}
          alt={title}
          fill
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
          per visit · added {format(parseISO(createdAt), "MMM d, yyyy")}
        </p>

        <label className="mt-4 flex items-center justify-between gap-3 rounded-2xl border border-white/80 bg-white/60 px-3.5 py-2.5 text-sm font-medium text-forest">
          Available
          <Switch
            checked={available}
            disabled={!actions.onToggleAvailable}
            onCheckedChange={(next) => actions.onToggleAvailable?.(id, next)}
            aria-label={`${title} availability`}
          />
        </label>

        <div className="mt-auto grid grid-cols-2 gap-2 pt-4">
          <Button
            type="button"
            disabled={!actions.onEdit}
            onClick={() => actions.onEdit?.(id)}
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
            disabled={!actions.onDelete}
            onClick={() => actions.onDelete?.(id)}
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
  const [tab, setTab] = useState<string>("all")
  const countOf = (key: string) =>
    key === "all"
      ? services.length
      : services.filter((s) => s.approval === key).length
  const visible = services.filter((s) => tab === "all" || s.approval === tab)

  return (
    <div>
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
                <ServiceCard service={service} actions={actions} />
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
    </div>
  )
}