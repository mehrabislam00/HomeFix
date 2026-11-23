import Link from "next/link"
import {
  ArrowLeft,
  CircleCheck,
  CircleX,
  CreditCard,
  ReceiptText,
} from "lucide-react"

import type { Booking } from "@/lib/dashboard-data"
import { btn } from "@/lib/button-styles"
import { cn, formatBDT } from "@/lib/utils"
import { PaymentStatusRefresh } from "./payment-status-refresh"

type PaymentResultState =
  "success" | "cancelled" | "failed" | "expired" | "pending"

const content: Record<
  PaymentResultState,
  { title: string; description: string }
> = {
  success: {
    title: "Payment successful",
    description: "Thank you! Your payment has been confirmed.",
  },
  cancelled: {
    title: "Payment cancelled",
    description: "No payment was taken. Your booking is still unpaid.",
  },
  failed: {
    title: "Payment could not be completed",
    description:
      "Stripe did not confirm this payment. Your booking remains unpaid; you can try again from My Services.",
  },
  expired: {
    title: "Checkout session expired",
    description:
      "This checkout session expired before payment was confirmed. Start a new payment from My Services.",
  },
  pending: {
    title: "Payment confirmation pending",
    description:
      "We could not confirm this payment yet. Your booking status has not been changed.",
  },
}

export function PaymentResultCard({
  state,
  booking,
  transactionId,
  bookingId,
}: {
  state: PaymentResultState
  booking?: Booking
  transactionId?: string
  bookingId?: string
}) {
  const Icon =
    state === "success"
      ? CircleCheck
      : state === "cancelled"
        ? CircleX
        : state === "failed" || state === "expired"
          ? CircleX
          : CreditCard
  const amount = booking?.finalAmount ?? booking?.estimate

  return (
    <main className="relative isolate flex min-h-screen items-center justify-center overflow-hidden bg-ivory px-5 py-12">
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 -z-10 overflow-hidden"
      >
        <div className="absolute -top-32 left-1/4 size-[420px] rounded-full bg-sage/20 blur-3xl" />
        <div className="absolute right-0 bottom-0 size-[460px] rounded-full bg-muted-sage/20 blur-3xl" />
      </div>

      <section className="glass-card w-full max-w-[500px] rounded-[1.75rem] border border-line/70 bg-surface/95 p-6 text-center shadow-[0_12px_36px_-20px_rgb(38_58_50/0.3)] sm:p-8">
        <span
          className={cn(
            "mx-auto flex size-14 items-center justify-center rounded-full",
            state === "success"
              ? "bg-status-success-bg text-status-success-fg"
              : state === "cancelled"
                ? "bg-status-cancelled-bg text-status-cancelled-fg"
                : state === "failed" || state === "expired"
                  ? "bg-status-rejected-bg text-status-rejected-fg"
                  : "bg-pale-sage text-forest"
          )}
        >
          <Icon aria-hidden className="size-7" strokeWidth={1.8} />
        </span>
        <h1 className="mt-4 font-[family-name:var(--font-manrope)] text-2xl font-extrabold tracking-tight text-forest sm:text-3xl">
          {content[state].title}
        </h1>
        <p className="mt-1 text-sm text-ink-soft">
          {content[state].description}
        </p>

        {(booking || transactionId) && (
          <dl className="mt-5 space-y-3 rounded-2xl bg-field/80 p-4 text-left text-sm">
            {booking && (
              <>
                <div className="flex items-start justify-between gap-4">
                  <dt className="text-ink-soft">Service</dt>
                  <dd className="text-right font-semibold text-forest">
                    {booking.serviceTitle}
                  </dd>
                </div>
                <div className="flex items-start justify-between gap-4">
                  <dt className="text-ink-soft">Booking</dt>
                  <dd className="max-w-[65%] text-right font-medium break-all text-ink">
                    {booking.id}
                  </dd>
                </div>
              </>
            )}
            {transactionId && (
              <div className="flex items-start justify-between gap-4">
                <dt className="text-ink-soft">Checkout session</dt>
                <dd className="max-w-[65%] text-right font-mono text-xs break-all text-ink">
                  {transactionId}
                </dd>
              </div>
            )}
            {state === "success" && booking?.paidAt && (
              <div className="flex items-start justify-between gap-4">
                <dt className="text-ink-soft">Date</dt>
                <dd className="text-right text-ink">
                  {new Intl.DateTimeFormat("en", {
                    dateStyle: "medium",
                    timeZone: "UTC",
                  }).format(new Date(booking.paidAt))}
                </dd>
              </div>
            )}
            {state === "success" && amount !== undefined && (
              <div className="flex items-center justify-between gap-4 border-t border-line/70 pt-3 font-semibold text-forest">
                <dt className="flex items-center gap-2">
                  <ReceiptText aria-hidden className="size-4" />
                  Amount paid
                </dt>
                <dd className="text-lg">{formatBDT(amount)}</dd>
              </div>
            )}
          </dl>
        )}

        {state === "cancelled" && (
          <p className="mt-4 text-sm text-ink-soft">
            You can return to My Services and try again when you’re ready.
          </p>
        )}
        {state === "pending" && (
          <>
            <p className="mt-4 text-sm text-ink-soft">
              Payment confirmation can take a moment. We’ll check for an update
              automatically.
            </p>
            {bookingId && (
              <div className="mt-4">
                <PaymentStatusRefresh />
              </div>
            )}
          </>
        )}

        <div className="mt-5 flex flex-wrap justify-center gap-2">
          {state === "success" && (
            <Link
              href="/customer-dashboard/payments"
              className={cn(btn.md, btn.primary)}
            >
              View payment history
            </Link>
          )}
          {(state === "cancelled" ||
            state === "failed" ||
            state === "expired") && (
            <Link
              href="/customer-dashboard/bookings"
              className={cn(btn.md, btn.primary)}
            >
              Return to My Services
            </Link>
          )}
          <Link
            href="/customer-dashboard"
            className={cn(btn.md, btn.secondary)}
          >
            <ArrowLeft aria-hidden className="size-4" />
            Back to dashboard
          </Link>
        </div>
      </section>
    </main>
  )
}
