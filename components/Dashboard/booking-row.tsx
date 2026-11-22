import Image from "next/image"
import Link from "next/link"
import { format, parseISO } from "date-fns"
import { CalendarDays, Eye } from "lucide-react"


import { Button } from "@/components/ui/button"
import type { Booking } from "@/lib/dashboard-data"
import { btn } from "@/lib/button-styles"
import { cn, formatBDT } from "@/lib/utils"
import { BookingStatusBadge, PaymentStatusBadge } from "./status-badge"

/** One booking. `compact` is the dashboard-overview variant (status only, no actions). */
export function BookingRow({
  booking,
  compact = false,
}: {
  booking: Booking
  compact?: boolean
}) {
  const {
    serviceId,
    serviceTitle,
    image,
    technician,
    date,
    estimate,
    status,
    paymentStatus,
  } = booking
  const when = format(parseISO(date), "MMM d, yyyy")

  return (
    <div
      className={cn(
        "group flex items-center gap-4 rounded-3xl transition-colors duration-200",
        compact
          ? "p-2 hover:bg-forest/5"
          : "glass-card relative p-4 hover:-translate-y-0.5 motion-reduce:hover:translate-y-0 sm:p-5"
      )}
    >
      <div
        className={cn(
          "relative shrink-0 overflow-hidden rounded-2xl ring-1 ring-forest/10",
          compact ? "size-14" : "size-16 sm:size-[72px]"
        )}
      >
        <Image
          src={image}
          alt=""
          fill
          sizes="72px"
          className="object-cover transition-transform duration-500 group-hover:scale-105 motion-reduce:transition-none"
        />
      </div>

      <div className="min-w-0 flex-1">
        <div className="flex flex-wrap items-center gap-x-2.5 gap-y-1.5">
          <h3 className="truncate font-[family-name:var(--font-manrope)] text-base font-bold tracking-tight text-forest">
            {serviceTitle}
          </h3>
          {!compact && <BookingStatusBadge status={status} />}
          {!compact && <PaymentStatusBadge status={paymentStatus} />}
        </div>
        {compact ? (
          <p className="mt-1 truncate text-xs text-ink-soft">
            {technician} · {when}
          </p>
        ) : (
          <>
            <p className="mt-1.5 text-sm text-ink-soft">
              Technician:{" "}
              <strong className="font-semibold text-ink">{technician}</strong>
            </p>
            <p className="mt-1 flex items-center gap-1.5 text-sm text-ink-soft">
              <CalendarDays aria-hidden className="size-3.5" />
              {when} ·{" "}
              <strong className="font-semibold text-ink">
                {formatBDT(estimate)}
              </strong>{" "}
              est.
            </p>
          </>
        )}
      </div>

      {compact ? (
        <BookingStatusBadge status={status} className="shrink-0" />
      ) : (
        <Button
          className={cn(
            btn.md,
            btn.secondary,
            "shrink-0 border border-forest/10 bg-pale-sage hover:bg-forest hover:text-white"
          )}
          asChild
        >
          <Link
            href={`/services/${serviceId}`}
            aria-label={`View ${serviceTitle}`}
          >
            <Eye aria-hidden className="size-4" />
            <span className="hidden sm:inline">Details</span>
          </Link>
        </Button>
      )}
    </div>
  )
}