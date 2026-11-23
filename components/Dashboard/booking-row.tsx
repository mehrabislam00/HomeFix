"use client"

import { useState } from "react"
import Image from "next/image"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { format, parseISO } from "date-fns"
import {
  CalendarDays,
  Eye,
  LoaderCircle,
  Phone,
  TriangleAlert,
  X,
} from "lucide-react"

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { toast } from "@/components/ui/toast"
import type { CancelBookingResult } from "@/lib/Action/booking-actions"
import { PayNowButton } from "@/components/Dashboard/pay-now-button"
import type { Booking } from "@/lib/dashboard-data"
import { btn } from "@/lib/button-styles"
import { NOTIFICATIONS_UPDATED_EVENT } from "@/lib/notification-types"
import { cn, formatBDT } from "@/lib/utils"
import { BookingStatusBadge, PaymentStatusBadge } from "./status-badge"

/** One booking. `compact` is the dashboard-overview variant (status only, no actions). */
export function BookingRow({
  booking,
  compact = false,
  showDetails = true,
  showPayNow = false,
  onCancelRequest,
  onCancelled,
}: {
  booking: Booking
  compact?: boolean
  showDetails?: boolean
  showPayNow?: boolean
  onCancelRequest?: (bookingId: string) => Promise<CancelBookingResult>
  onCancelled?: (bookingId: string) => void
}) {
  const router = useRouter()
  const [confirmOpen, setConfirmOpen] = useState(false)
  const [contactOpen, setContactOpen] = useState(false)
  const [cancelling, setCancelling] = useState(false)
  const {
    id,
    serviceTitle,
    image,
    technician,
    date,
    estimate,
    finalAmount,
    status,
    paymentStatus,
  } = booking
  const when = date
    ? format(parseISO(date), "MMM d, yyyy")
    : "Date not provided"
  const amount = finalAmount ?? estimate
  const isPending = status === "requested"
  const needsTechnicianContact =
    status === "accepted" || status === "in_progress"
  const technicianPhone = booking.technicianPhone?.trim()
  const technicianDialNumber = technicianPhone?.replace(/[^\d+]/g, "")
  const technicianPhoneHref =
    technicianDialNumber && technicianDialNumber !== "+"
      ? `tel:${technicianDialNumber}`
      : undefined

  async function cancelRequest() {
    if (!onCancelRequest || cancelling) return
    setCancelling(true)
    const result = await onCancelRequest(id)
    setCancelling(false)
    if (!result.ok) {
      toast.add({
        title: "Unable to cancel request",
        description: result.error,
        type: "error",
        priority: "high",
      })
      return
    }

    setConfirmOpen(false)
    onCancelled?.(id)
    window.dispatchEvent(new Event(NOTIFICATIONS_UPDATED_EVENT))
    toast.add({
      title: "Service request cancelled",
      description: `Your request for ${serviceTitle} has been cancelled.`,
      type: "success",
    })
    router.refresh()
  }

  return (
    <div
      className={cn(
        "group flex items-center gap-4 rounded-3xl transition-colors duration-200",
        compact
          ? "border border-transparent p-2 hover:border-white/80 hover:bg-white/60"
          : "glass-card relative flex-wrap p-4 hover:-translate-y-0.5 motion-reduce:hover:translate-y-0 sm:flex-nowrap sm:p-5"
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
          unoptimized={typeof image === "string"}
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
                {formatBDT(amount)}
              </strong>{" "}
              {finalAmount ? "final" : "est."}
            </p>
          </>
        )}
      </div>

      {compact ? (
        <BookingStatusBadge status={status} className="shrink-0" />
      ) : (
        <div className="flex shrink-0 flex-wrap gap-2">
          {showDetails && (
            <Button
              className={cn(
                btn.md,
                btn.secondary,
                "border border-white/80 bg-white/70 text-forest shadow-[inset_0_1px_0_rgb(255_255_255/0.9)] hover:bg-forest hover:text-white"
              )}
              asChild
            >
              <Link
                href={`/customer-dashboard/bookings/${id}`}
                aria-label={`View ${serviceTitle}`}
              >
                <Eye aria-hidden className="size-4" />
                <span className="hidden sm:inline">Details</span>
              </Link>
            </Button>
          )}
          {showPayNow && <PayNowButton booking={booking} />}
          {onCancelRequest && isPending && (
            <Button
              type="button"
              onClick={() => setConfirmOpen(true)}
              className={cn(
                btn.md,
                "border border-status-rejected-fg/15 bg-status-rejected-bg/70 text-status-rejected-fg hover:bg-status-rejected-bg"
              )}
            >
              <X aria-hidden className="size-4" />
              Cancel Request
            </Button>
          )}
          {onCancelRequest && needsTechnicianContact && (
            <Button
              type="button"
              onClick={() => setContactOpen(true)}
              className={cn(
                btn.md,
                "border border-white/80 bg-white/70 text-forest shadow-[inset_0_1px_0_rgb(255_255_255/0.9)] hover:bg-forest hover:text-white"
              )}
            >
              <Phone aria-hidden className="size-4" />
              <span className="hidden sm:inline">Request Cancellation</span>
              <span className="sm:hidden">Contact</span>
            </Button>
          )}
        </div>
      )}
      {!compact && onCancelRequest && isPending && (
        <Dialog
          open={confirmOpen}
          onOpenChange={(next) => {
            if (!cancelling) setConfirmOpen(next)
          }}
        >
          <DialogContent className="glass-card w-[calc(100%-2rem)] max-w-md rounded-[1.75rem] border border-white/70 bg-ivory/90 p-5 shadow-[0_28px_60px_-22px_rgb(38_58_50/0.5)] backdrop-blur-2xl sm:p-7">
            <DialogHeader className="pr-7">
              <DialogTitle className="font-[family-name:var(--font-manrope)] text-xl font-bold text-forest">
                Cancel this service request?
              </DialogTitle>
              <DialogDescription className="text-sm leading-6 text-ink-soft">
                Your request for {serviceTitle} will be marked as cancelled. You
                can book this service again later if you change your mind.
              </DialogDescription>
            </DialogHeader>
            <div className="flex flex-col-reverse gap-2 pt-1 sm:flex-row sm:justify-end">
              <Button
                type="button"
                disabled={cancelling}
                onClick={() => setConfirmOpen(false)}
                className={cn(btn.md, btn.outline)}
              >
                Keep Request
              </Button>
              <Button
                type="button"
                disabled={cancelling}
                onClick={() => void cancelRequest()}
                className={cn(
                  btn.md,
                  "bg-status-rejected-fg text-white hover:bg-status-rejected-fg/90"
                )}
              >
                {cancelling ? (
                  <LoaderCircle aria-hidden className="size-4 animate-spin" />
                ) : (
                  <X aria-hidden className="size-4" />
                )}
                {cancelling ? "Cancelling..." : "Cancel Request"}
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      )}
      {!compact && onCancelRequest && needsTechnicianContact && (
        <Dialog open={contactOpen} onOpenChange={setContactOpen}>
          <DialogContent className="glass-card w-[calc(100%-2rem)] max-w-lg rounded-[1.75rem] border border-white/70 bg-ivory/90 p-5 shadow-[0_28px_60px_-22px_rgb(38_58_50/0.5)] backdrop-blur-2xl sm:p-7">
            <DialogHeader className="pr-7">
              <span className="mb-1 flex size-11 items-center justify-center rounded-2xl bg-pale-sage text-forest ring-1 ring-forest/10">
                <TriangleAlert aria-hidden className="size-5" />
              </span>
              <DialogTitle className="font-[family-name:var(--font-manrope)] text-xl font-bold text-forest">
                Contact your technician
              </DialogTitle>
              <DialogDescription className="text-sm leading-6 text-ink-soft">
                Your service request has already been approved by the
                technician. To cancel this service, please contact the assigned
                technician directly and request cancellation.
              </DialogDescription>
            </DialogHeader>

            <p className="rounded-2xl border border-forest/10 bg-white/60 px-4 py-3 text-sm leading-6 text-ink">
              Please call the technician using the contact number below and
              inform them that you no longer wish to continue with this service.
            </p>

            <div className="flex items-center gap-3 rounded-2xl border border-white/80 bg-white/70 p-3.5 shadow-[inset_0_1px_0_rgb(255_255_255/0.9)]">
              <Avatar size="lg" className="size-12 ring-2 ring-white">
                {booking.technicianImage && (
                  <AvatarImage src={booking.technicianImage} alt={technician} />
                )}
                <AvatarFallback className="bg-sage text-sm font-semibold text-white">
                  {technician
                    .split(" ")
                    .map((part) => part[0])
                    .join("")
                    .slice(0, 2)
                    .toUpperCase()}
                </AvatarFallback>
              </Avatar>
              <div className="min-w-0 flex-1">
                <p className="text-xs font-medium text-ink-soft">
                  Assigned technician
                </p>
                <p className="truncate font-[family-name:var(--font-manrope)] text-base font-bold text-forest">
                  {technician}
                </p>
                <p className="mt-0.5 text-sm font-medium text-ink">
                  {technicianPhone || "Phone number unavailable"}
                </p>
              </div>
            </div>

            <div className="flex flex-col-reverse gap-2 sm:flex-row sm:justify-end">
              <Button
                type="button"
                onClick={() => setContactOpen(false)}
                className={cn(btn.md, btn.outline)}
              >
                Close
              </Button>
              {technicianPhoneHref && (
                <Button asChild className={cn(btn.md, btn.primary)}>
                  <a href={technicianPhoneHref}>
                    <Phone aria-hidden className="size-4" />
                    Call Technician
                  </a>
                </Button>
              )}
            </div>
          </DialogContent>
        </Dialog>
      )}
    </div>
  )
}
