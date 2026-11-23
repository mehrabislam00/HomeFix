"use client"

import { useState } from "react"
import { CreditCard } from "lucide-react"

import { startCustomerPayment } from "@/lib/Action/payment-actions"
import type { Booking } from "@/lib/dashboard-data"
import { btn } from "@/lib/button-styles"
import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { cn, formatBDT } from "@/lib/utils"

const terminalStatuses = new Set(["rejected", "cancelled"])

export function PayNowButton({ booking }: { booking: Booking }) {
  const [pending, setPending] = useState(false)
  const [message, setMessage] = useState("")
  const [open, setOpen] = useState(false)

  if (booking.paymentStatus !== "unpaid") return null

  const canPay =
    !terminalStatuses.has(booking.status) &&
    ["accepted", "in_progress", "completed"].includes(booking.status)

  async function handlePay() {
    if (!canPay || pending) return
    setPending(true)
    setMessage("")
    try {
      const result = await startCustomerPayment(booking.id)
      if (!result.ok) {
        setMessage(result.error)
        return
      }
      setMessage("Opening secure checkout…")
      setOpen(false)
      window.location.assign(result.checkoutUrl)
    } catch (error) {
      setMessage(
        error instanceof Error
          ? error.message
          : "Unable to start payment. Please try again."
      )
    } finally {
      setPending(false)
    }
  }

  return (
    <>
      <div className="flex flex-col items-start gap-1">
        <Button
          type="button"
          disabled={!canPay || pending}
          onClick={() => setOpen(true)}
          aria-describedby={`payment-help-${booking.id}`}
          className={cn(btn.md, btn.primary)}
        >
          <CreditCard aria-hidden className="size-4" />
          Pay Now
        </Button>
        <span
          id={`payment-help-${booking.id}`}
          aria-live="polite"
          className="max-w-52 text-xs text-ink-soft"
        >
          {message ||
            (canPay
              ? ""
              : terminalStatuses.has(booking.status)
                ? "Unavailable for this booking"
                : "Available after technician acceptance")}
        </span>
      </div>
      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Review your payment</DialogTitle>
            <DialogDescription>
              Confirm the booking details before continuing to Stripe Checkout.
            </DialogDescription>
          </DialogHeader>
          <dl className="space-y-3 rounded-xl bg-muted/50 p-4 text-sm">
            <div className="flex justify-between gap-4">
              <dt className="text-muted-foreground">Service</dt>
              <dd className="text-right font-medium">{booking.serviceTitle}</dd>
            </div>
            <div className="flex justify-between gap-4">
              <dt className="text-muted-foreground">Booking</dt>
              <dd className="font-mono text-xs">{booking.id}</dd>
            </div>
            <div className="flex justify-between gap-4 border-t pt-3 font-semibold">
              <dt>Total in BDT</dt>
              <dd>{formatBDT(booking.finalAmount ?? booking.estimate)}</dd>
            </div>
          </dl>
          {message && (
            <p role="alert" className="text-sm text-status-rejected-fg">
              {message}
            </p>
          )}
          <DialogFooter>
            <Button
              type="button"
              disabled={pending}
              onClick={() => setOpen(false)}
              className={cn(btn.md, btn.secondary)}
            >
              Cancel
            </Button>
            <Button
              type="button"
              disabled={pending}
              onClick={handlePay}
              className={cn(btn.md, btn.primary)}
            >
              <CreditCard aria-hidden className="size-4" />
              {pending ? "Please wait…" : "Continue to payment"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  )
}
