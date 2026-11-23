"use client"

import { useState } from "react"
import Image from "next/image"
import Link from "next/link"
import { format, parseISO } from "date-fns"
import { CalendarDays, Eye, MapPin, Phone, UserRound } from "lucide-react"

import {
  BookingStatusBadge,
  PaymentStatusBadge,
} from "@/components/Dashboard/status-badge"
import { Button } from "@/components/ui/button"
import type { BookingStatus } from "@/lib/dashboard-data"
import { btn } from "@/lib/button-styles"
import type { JobAction, JobRequest } from "@/lib/technician-data"
import { cn, formatBDT } from "@/lib/utils"

const actionsFor: Record<
  BookingStatus,
  { action: JobAction; label: string; primary?: boolean }[]
> = {
  requested: [
    { action: "accept", label: "Accept", primary: true },
    { action: "reject", label: "Reject" },
  ],
  accepted: [{ action: "start", label: "Start job", primary: true }],
  in_progress: [{ action: "complete", label: "Mark complete", primary: true }],
  completed: [],
  rejected: [],
  cancelled: [],
}

/**
 * One customer job. `compact` is the overview variant (no actions), mirroring
 * BookingRow. Without `onAction` the buttons render disabled, so nothing pretends
 * to be saved.
 */
export function JobRow({
  job,
  compact = false,
  showDetails = true,
  onAction,
  busy = false,
}: {
  job: JobRequest
  compact?: boolean
  showDetails?: boolean
  onAction?: (job: JobRequest, action: JobAction, finalAmount?: number) => void
  busy?: boolean
}) {
  const when = job.date
    ? format(parseISO(job.date), "MMM d, yyyy")
    : "Date not provided"
  const amount = job.finalAmount ?? job.estimate
  const [finalAmount, setFinalAmount] = useState("")
  const [amountError, setAmountError] = useState("")

  function runAction(action: JobAction) {
    if (action === "complete" && finalAmount.trim()) {
      const parsed = Number(finalAmount)
      if (!Number.isFinite(parsed) || parsed <= 0) {
        setAmountError("Enter a final amount greater than 0.")
        return
      }
      onAction?.(job, action, parsed)
    } else {
      onAction?.(job, action)
    }
    setAmountError("")
  }

  return (
    <div
      className={cn(
        "group flex items-center gap-4 rounded-3xl transition-colors duration-200",
        compact
          ? "border border-transparent p-2 hover:border-white/80 hover:bg-white/60"
          : "glass-card relative flex-wrap p-4 hover:-translate-y-0.5 motion-reduce:hover:translate-y-0 sm:p-5 lg:flex-nowrap"
      )}
    >
      <div
        className={cn(
          "relative shrink-0 overflow-hidden rounded-2xl ring-1 ring-forest/10",
          compact ? "size-14" : "size-16 sm:size-[72px]"
        )}
      >
        <Image
          src={job.image}
          alt=""
          fill
          unoptimized={typeof job.image === "string"}
          sizes="72px"
          className="object-cover transition-transform duration-500 group-hover:scale-105 motion-reduce:transition-none"
        />
      </div>

      <div className="min-w-0 flex-1">
        <div className="flex flex-wrap items-center gap-x-2.5 gap-y-1.5">
          <h3 className="truncate font-[family-name:var(--font-manrope)] text-base font-bold tracking-tight text-forest">
            {job.serviceTitle}
          </h3>
          {!compact && <BookingStatusBadge status={job.status} />}
          {!compact && job.status === "completed" && (
            <PaymentStatusBadge status={job.paymentStatus} />
          )}
        </div>

        {compact ? (
          <p className="mt-1 truncate text-xs text-ink-soft">
            {job.customerName} · {when}
          </p>
        ) : (
          <div className="mt-1.5 grid gap-1 text-sm text-ink-soft sm:grid-cols-2 sm:gap-x-6">
            <p className="flex items-center gap-1.5">
              <UserRound aria-hidden className="size-3.5 shrink-0" />
              <strong className="truncate font-semibold text-ink">
                {job.customerName}
              </strong>
            </p>
            <p className="flex items-center gap-1.5">
              <Phone aria-hidden className="size-3.5 shrink-0" />
              {job.customerPhone ? (
                <a
                  href={`tel:${job.customerPhone.replace(/[^\d+]/g, "")}`}
                  className="truncate rounded hover:text-forest focus-visible:outline-2 focus-visible:outline-sage"
                >
                  {job.customerPhone}
                </a>
              ) : (
                <span>Phone not provided</span>
              )}
            </p>
            <p className="flex items-center gap-1.5">
              <CalendarDays aria-hidden className="size-3.5 shrink-0" />
              {job.timeSlot ? `${when} · ${job.timeSlot}` : when}
            </p>
            <p className="flex items-center gap-1.5">
              <MapPin aria-hidden className="size-3.5 shrink-0" />
              <span className="truncate">{job.address}</span>
            </p>
            {job.notes && (
              <p className="text-xs text-ink-muted sm:col-span-2">
                Note: {job.notes}
              </p>
            )}
          </div>
        )}
      </div>

      {compact ? (
        <BookingStatusBadge status={job.status} className="shrink-0" />
      ) : (
        <div className="flex w-full shrink-0 flex-col gap-3 sm:w-auto sm:items-end">
          <p className="text-sm text-ink-soft">
            {job.finalAmount ? "Final" : "Estimate"}{" "}
            <strong className="font-[family-name:var(--font-manrope)] text-lg font-extrabold text-forest tabular-nums">
              {formatBDT(amount)}
            </strong>
          </p>
          {showDetails && (
            <Button
              type="button"
              asChild
              className={cn(
                btn.md,
                "border border-white/80 bg-white/70 text-forest shadow-[inset_0_1px_0_rgb(255_255_255/0.9)] hover:bg-forest hover:text-white"
              )}
            >
              <Link href={`/technician-dashboard/requests/${job.id}`}>
                <Eye aria-hidden className="size-4" />
                Booking details
              </Link>
            </Button>
          )}
          {actionsFor[job.status].length > 0 && (
            <div className="flex flex-wrap gap-2">
              {job.status === "in_progress" && (
                <label className="flex items-center gap-2 text-xs font-medium text-ink-soft">
                  Final amount (optional)
                  <input
                    type="number"
                    min="1"
                    step="any"
                    value={finalAmount}
                    onChange={(event) => {
                      setFinalAmount(event.target.value)
                      setAmountError("")
                    }}
                    className="h-9 w-28 rounded-lg border border-line-strong bg-surface px-2 text-sm text-ink"
                  />
                </label>
              )}
              {actionsFor[job.status].map(({ action, label, primary }) => (
                <Button
                  key={action}
                  type="button"
                  disabled={!onAction || busy}
                  onClick={() => runAction(action)}
                  className={cn(
                    btn.md,
                    primary
                      ? btn.primary
                      : "border border-white/80 bg-white/70 text-forest shadow-[inset_0_1px_0_rgb(255_255_255/0.9)] hover:bg-status-rejected-bg hover:text-status-rejected-fg"
                  )}
                >
                  {busy ? "Updating..." : label}
                </Button>
              ))}
            </div>
          )}
          {amountError && (
            <p
              role="alert"
              className="text-xs font-medium text-status-rejected-fg"
            >
              {amountError}
            </p>
          )}
        </div>
      )}
    </div>
  )
}
