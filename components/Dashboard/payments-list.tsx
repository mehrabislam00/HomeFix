"use client"

import { useState } from "react"
import { format, parseISO } from "date-fns"
import { CreditCard, Eye, ReceiptText } from "lucide-react"

import {
  getCustomerPayment,
  getTechnicianPayment,
} from "@/lib/Action/payment-actions"
import type { Payment } from "@/lib/dashboard-data"
import { cn, formatBDT } from "@/lib/utils"
import { btn } from "@/lib/button-styles"
import { DetailRows, DetailSheet } from "@/components/Admin/detail-sheet"
import { BlurFade } from "@/components/magic/blur-fade"
import { EmptyState } from "./empty-state"
import { PaymentStatusBadge } from "./status-badge"

type PaymentOwner = "customer" | "technician"

export function PaymentsList({
  payments,
  owner = "customer",
}: {
  payments: Payment[]
  owner?: PaymentOwner
}) {
  const [selectedId, setSelectedId] = useState("")
  const [selectedPayment, setSelectedPayment] = useState<Payment | null>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState("")

  async function showDetails(paymentId: string) {
    setSelectedId(paymentId)
    setSelectedPayment(null)
    setError("")
    setLoading(true)
    try {
      const payment =
        owner === "customer"
          ? await getCustomerPayment(paymentId)
          : await getTechnicianPayment(paymentId)
      setSelectedPayment(payment)
    } catch (detailError) {
      console.error("Unable to load payment details.", detailError)
      setError(
        detailError instanceof Error
          ? detailError.message
          : "Unable to load payment details."
      )
    } finally {
      setLoading(false)
    }
  }

  const relatedPartyRows =
    selectedPayment && owner === "customer"
      ? [
          { label: "Technician", value: selectedPayment.technicianName },
          { label: "Technician email", value: selectedPayment.technicianEmail },
        ]
      : selectedPayment
        ? [
            { label: "Customer", value: selectedPayment.customerName },
            { label: "Customer email", value: selectedPayment.customerEmail },
          ]
        : []

  return (
    <>
      <BlurFade fade={false} delay={0.1} y={16}>
        <section className="glass-card relative rounded-[1.75rem] p-4 sm:p-6">
          {payments.length === 0 ? (
            <EmptyState
              icon={CreditCard}
              title="No payments yet"
              description="Verified payments will appear here."
            />
          ) : (
            <ul className="flex flex-col gap-1">
              {payments.map((payment) => (
                <li
                  key={payment.id}
                  className="group/row -mx-2 flex flex-wrap items-center gap-4 rounded-2xl px-2 py-4 transition-colors hover:bg-white/60"
                >
                  <span className="flex size-11 shrink-0 items-center justify-center rounded-xl bg-pale-sage text-forest ring-1 ring-forest/10 transition-transform duration-300 group-hover/row:scale-105">
                    <ReceiptText
                      aria-hidden
                      strokeWidth={1.75}
                      className="size-5"
                    />
                  </span>
                  <div className="min-w-0 flex-1">
                    <p className="truncate font-[family-name:var(--font-manrope)] text-base font-bold text-forest">
                      {payment.serviceTitle}
                    </p>
                    <p className="mt-1 text-sm text-ink-soft">
                      {format(parseISO(payment.paidAt), "MMM d, yyyy")} ·{" "}
                      {payment.method}
                    </p>
                    <p className="mt-1 truncate text-xs text-ink-muted">
                      {owner === "technician"
                        ? `Customer: ${payment.customerName} · ${payment.customerEmail}`
                        : `Technician: ${payment.technicianName}`}
                    </p>
                    <p className="mt-1 truncate font-mono text-xs text-ink-muted">
                      Transaction: {payment.transactionId}
                    </p>
                  </div>
                  <div className="flex items-center gap-4">
                    <div className="flex flex-col items-end gap-1.5">
                      <strong className="font-[family-name:var(--font-manrope)] text-lg font-extrabold text-forest tabular-nums">
                        {formatBDT(payment.amount)}
                      </strong>
                      <span className="text-xs text-ink-soft">
                        {payment.currency}
                      </span>
                    </div>
                    <PaymentStatusBadge status={payment.paymentStatus} />
                  </div>
                  <button
                    type="button"
                    className={cn(btn.md, btn.secondary, "ml-auto sm:ml-0")}
                    onClick={() => void showDetails(payment.id)}
                    disabled={loading}
                    aria-label={`View payment details for ${payment.serviceTitle}`}
                  >
                    <Eye aria-hidden className="size-4" />
                    Details
                  </button>
                </li>
              ))}
            </ul>
          )}
        </section>
      </BlurFade>

      <DetailSheet
        open={Boolean(selectedId)}
        onOpenChange={(open) => {
          if (!open) {
            setSelectedId("")
            setSelectedPayment(null)
            setError("")
          }
        }}
        title="Payment details"
      >
        {loading && (
          <p className="text-sm text-ink-soft">Loading payment details…</p>
        )}
        {error && (
          <p role="alert" className="text-sm text-status-rejected-fg">
            {error}
          </p>
        )}
        {selectedPayment && (
          <>
            <DetailRows
              rows={[
                { label: "Service", value: selectedPayment.serviceTitle },
                {
                  label: "Booking reference",
                  value: selectedPayment.bookingId,
                },
                ...relatedPartyRows,
                { label: "Amount", value: formatBDT(selectedPayment.amount) },
                { label: "Currency", value: selectedPayment.currency },
                { label: "Status", value: "Paid" },
                { label: "Payment method", value: selectedPayment.method },
                {
                  label: "Transaction ID",
                  value: selectedPayment.transactionId,
                },
                {
                  label: "Stripe session",
                  value: selectedPayment.stripeSessionId,
                },
                {
                  label: "Paid at",
                  value: format(parseISO(selectedPayment.paidAt), "PPpp"),
                },
              ]}
            />
          </>
        )}
      </DetailSheet>
    </>
  )
}
