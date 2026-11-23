"use client"

import { useState } from "react"
import { format, isAfter, parseISO, startOfYear, subDays } from "date-fns"
import { Eye, ReceiptText } from "lucide-react"

import { DetailRows, DetailSheet } from "@/components/Admin/detail-sheet"
import { EmptyState } from "@/components/Dashboard/empty-state"
import { PaymentStatusBadge } from "@/components/Dashboard/status-badge"
import { getAdminTransaction } from "@/lib/Action/admin-actions"
import type { AdminTransaction } from "@/lib/admin-data"
import { btn } from "@/lib/button-styles"
import { cn, formatBDT } from "@/lib/utils"
import { rowClass, tdClass, thClass, TableCard } from "./table-card"
import { FilterSelect, SearchInput } from "./table-toolbar"

const dateFilters = [
  { value: "all", label: "Any date" },
  { value: "7", label: "Last 7 days" },
  { value: "30", label: "Last 30 days" },
  { value: "year", label: "This year" },
]

export function TransactionsTable({
  transactions,
}: {
  transactions: AdminTransaction[]
}) {
  const [query, setQuery] = useState("")
  const [dateFilter, setDateFilter] = useState("all")
  const [selectedId, setSelectedId] = useState("")
  const [selected, setSelected] = useState<AdminTransaction | null>(null)
  const [loading, setLoading] = useState(false)
  const [detailError, setDetailError] = useState("")
  const needle = query.trim().toLowerCase().replace(/^#/, "")
  const cutoff =
    dateFilter === "year"
      ? startOfYear(new Date())
      : dateFilter === "all"
        ? null
        : subDays(new Date(), Number(dateFilter))
  const visible = transactions.filter((transaction) => {
    const matchesSearch =
      !needle ||
      [
        transaction.id,
        transaction.transactionId,
        transaction.stripeSessionId,
        transaction.bookingId,
        transaction.customer,
        transaction.customerEmail,
        transaction.serviceTitle,
        transaction.technician,
        transaction.technicianEmail,
        transaction.paymentStatus,
        transaction.currency,
        transaction.method,
      ].some((value) => value.toLowerCase().includes(needle))
    const matchesDate = !cutoff || isAfter(parseISO(transaction.paidAt), cutoff)
    return matchesSearch && matchesDate
  })

  async function showDetails(paymentId: string) {
    setSelectedId(paymentId)
    setSelected(null)
    setDetailError("")
    setLoading(true)
    try {
      const payment = await getAdminTransaction(paymentId)
      if (!payment)
        throw new Error("The payment record is no longer available.")
      setSelected(payment)
    } catch (error) {
      console.error("Unable to load admin payment details.", error)
      setDetailError(
        error instanceof Error
          ? error.message
          : "Unable to load payment details."
      )
    } finally {
      setLoading(false)
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
              label="Search payments"
              placeholder="Search transaction, session, booking or user..."
            />
            <FilterSelect
              value={dateFilter}
              onChange={setDateFilter}
              options={dateFilters}
              label="Filter payments by date"
            />
          </>
        }
      >
        <p aria-live="polite" className="sr-only">
          {visible.length} payments
        </p>
        {visible.length ? (
          <table className="w-full min-w-[1120px] border-collapse">
            <thead className="bg-pale-sage/60">
              <tr>
                <th scope="col" className={thClass}>
                  Transaction ID
                </th>
                <th scope="col" className={thClass}>
                  Customer
                </th>
                <th scope="col" className={thClass}>
                  Service / Booking
                </th>
                <th scope="col" className={thClass}>
                  Technician
                </th>
                <th scope="col" className={thClass}>
                  Date
                </th>
                <th scope="col" className={thClass}>
                  Amount
                </th>
                <th scope="col" className={thClass}>
                  Status
                </th>
                <th scope="col" className={thClass}>
                  Details
                </th>
              </tr>
            </thead>
            <tbody>
              {visible.map((transaction) => (
                <tr key={transaction.id} className={rowClass}>
                  <td className={cn(tdClass, "font-mono text-xs")}>
                    {transaction.transactionId}
                  </td>
                  <td className={tdClass}>
                    <p className="font-semibold text-forest">
                      {transaction.customer}
                    </p>
                    <p className="mt-0.5 text-xs text-ink-muted">
                      {transaction.customerEmail}
                    </p>
                  </td>
                  <td className={tdClass}>
                    <p className="text-ink">{transaction.serviceTitle}</p>
                    <p className="mt-0.5 text-xs text-ink-muted">
                      #{transaction.bookingId}
                    </p>
                  </td>
                  <td className={tdClass}>
                    <p className="text-ink">{transaction.technician}</p>
                    <p className="mt-0.5 text-xs text-ink-muted">
                      {transaction.technicianEmail}
                    </p>
                  </td>
                  <td className={cn(tdClass, "whitespace-nowrap")}>
                    {format(parseISO(transaction.paidAt), "MMM d, yyyy")}
                  </td>
                  <td
                    className={cn(
                      tdClass,
                      "font-semibold text-forest tabular-nums"
                    )}
                  >
                    {formatBDT(transaction.amount)}
                    <span className="ml-1 text-xs font-normal text-ink-muted">
                      {transaction.currency}
                    </span>
                  </td>
                  <td className={tdClass}>
                    <PaymentStatusBadge status={transaction.paymentStatus} />
                  </td>
                  <td className={tdClass}>
                    <button
                      type="button"
                      className={cn(btn.md, btn.secondary)}
                      onClick={() => void showDetails(transaction.id)}
                      disabled={loading}
                      aria-label={`View payment details for ${transaction.serviceTitle}`}
                    >
                      <Eye aria-hidden className="size-4" />
                      View
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        ) : (
          <div className="p-4 pt-0 sm:p-5 sm:pt-0">
            <EmptyState
              icon={ReceiptText}
              title="No payments found"
              description={
                transactions.length
                  ? "Try a different search or date range."
                  : "Verified payments will be listed here."
              }
            />
          </div>
        )}
      </TableCard>

      <DetailSheet
        open={Boolean(selectedId)}
        onOpenChange={(open) => {
          if (!open) {
            setSelectedId("")
            setSelected(null)
            setDetailError("")
          }
        }}
        title="Payment details"
      >
        {loading && (
          <p className="text-sm text-ink-soft">Loading payment details…</p>
        )}
        {detailError && (
          <p role="alert" className="text-sm text-status-rejected-fg">
            {detailError}
          </p>
        )}
        {selected && (
          <DetailRows
            rows={[
              { label: "Payment record", value: selected.id },
              { label: "Booking reference", value: selected.bookingId },
              { label: "Service", value: selected.serviceTitle },
              { label: "Customer", value: selected.customer },
              { label: "Customer email", value: selected.customerEmail },
              { label: "Technician", value: selected.technician },
              { label: "Technician email", value: selected.technicianEmail },
              { label: "Amount", value: formatBDT(selected.amount) },
              { label: "Currency", value: selected.currency },
              { label: "Payment status", value: "Paid" },
              { label: "Payment method", value: selected.method },
              { label: "Transaction ID", value: selected.transactionId },
              { label: "Stripe session ID", value: selected.stripeSessionId },
              {
                label: "Paid at",
                value: format(parseISO(selected.paidAt), "PPpp"),
              },
            ]}
          />
        )}
      </DetailSheet>
    </>
  )
}
